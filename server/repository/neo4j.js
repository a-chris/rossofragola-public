import _ from 'lodash';
import neo4j from 'neo4j-driver';

const NEO4J_HOST = process.env.NEXT_PUBLIC_NEO4J_HOST;
const NEO4J_USER = process.env.NEXT_PUBLIC_NEO4J_USER;
const NEO4J_PASSWORD = process.env.NEXT_PUBLIC_NEO4J_PASSWORD;

const driver = neo4j.driver(`bolt://${NEO4J_HOST}:7687`, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));

export async function getIngredientsList() {
    const session = driver.session();
    const result = await session.run(
        `MATCH (i: Ingredient)
        RETURN i.name as NAME, i.code as CODE, i.recipes_count as RECIPES_COUNT`
    );
    session.close();
    const ingredients = result.records.map((r) => ({
        name: r.get('NAME'),
        code: r.get('CODE').low,
        recipes_count: r.get('RECIPES_COUNT').low,
    }));
    return _.orderBy(ingredients, 'name');
}

export async function getSuggestionsList() {
    const session = driver.session();
    const suggestionsData = [
        {
            text: "Sapevi che per fare un dolce con l'avocado puoi usare questi ingredienti?",
            code: 4102,
            recipeType: 'sweet',
            limit: 3,
        },
        {
            text: 'Sapevi che i chiodi di garofano possono essere cucinati con decine di ingredienti?',
            code: 4223,
            recipeType: 'both',
            limit: 8,
        },
    ];

    const suggestions = [];
    for (const s of suggestionsData) {
        const recipeType = s.recipeType === 'both' ? 'count' : s.recipeType;
        const matches = await runSingleIngredientQuery(session, s.code, recipeType);
        suggestions.push({
            text: s.text,
            matches: _.take(matches, s.limit),
        });
    }
    session.close();
    return suggestions;
}

export async function findIngredientsMatches(ingredientsCodes, recipeType) {
    const session = driver.session();
    const type = recipeType === 'both' ? 'count' : recipeType;
    try {
        const result =
            ingredientsCodes.length === 1
                ? await runSingleIngredientQuery(session, ingredientsCodes[0], type)
                : await runMultipleIngredientsQuery(session, ingredientsCodes, type);
        return _.orderBy(result, 'affinity', 'desc');
    } catch (err) {
        console.error(err);
        return [];
    } finally {
        await session.close();
    }
}

async function runSingleIngredientQuery(session, ingredientCode, recipeType) {
    const query = `MATCH (i1:Ingredient {code: $code})-[rel]-(i2:Ingredient)
                    RETURN i2.code AS CODE, i2.name as NAME, rel.${recipeType} as COUNT
                    ORDER BY rel.${recipeType} DESC
                    LIMIT 50`;
    const result = await session.run(query, { code: ingredientCode });

    const objects = result.records
        .map((r) => ({
            name: r.get('NAME'),
            code: r.get('CODE').low,
            counts: r.get('COUNT').low,
        }))
        .filter((o) => o.counts != 0);
    return objects.length === 0 ? [] : calculateAffinity(objects);
}

async function runMultipleIngredientsQuery(session, ingredientsCodes, recipeType) {
    const matches = [];
    const wheres = [];
    const returns = [];
    const codesKeys = [];
    const columnNames = [];
    ingredientsCodes.forEach((_, idx) => {
        matches.push(`(i${idx}: Ingredient)-[rel${idx}]-(ingr: Ingredient)`);
        wheres.push(`i${idx}.code = $code${idx}`);
        returns.push(`rel${idx}.${recipeType} as COUNT${idx}`);
        codesKeys.push(`code${idx}`);
        columnNames.push(`COUNT${idx}`);
    });

    const query = `MATCH ${matches.join(',')}
                    WHERE ${wheres.join(' AND ')}
                    RETURN DISTINCT ingr.code as CODE, ingr.name AS NAME, ${returns.join(',')}`;
    const result = await session.run(query, _.zipObject(codesKeys, ingredientsCodes));

    if (result.records.length === 0) {
        return [];
    }

    const objects = result.records.map((r) => ({
        name: r.get('NAME'),
        code: r.get('CODE').low,
        counts: columnNames.map((colName) => r.get(colName).low),
    }));
    return calculateAffinity(sumCountsColumns(objects).filter((o) => o.counts != 0));
}

function sumCountsColumns(objects) {
    const indexes = _.range(0, objects[0].counts.length);
    const maxOfEachColumn = indexes.map((idx) => _.maxBy(objects, (o) => o.counts[idx]).counts[idx]);
    const minOfEachColumn = indexes.map((idx) => _.minBy(objects, (o) => o.counts[idx]).counts[idx]);
    return objects.map((o) => ({
        ...o,
        counts: _.sum(o.counts.map((c, idx) => normalizeValue(c, minOfEachColumn[idx], maxOfEachColumn[idx]))),
    }));
}

function calculateAffinity(objects) {
    const maxOfAffinities = _.maxBy(objects, 'counts').counts;
    const minOfAffinities = _.minBy(objects, 'counts').counts;
    return objects.map((o) => ({
        name: o.name,
        code: o.code,
        affinity: normalizeValue(o.counts, minOfAffinities, maxOfAffinities),
    }));
}

function normalizeValue(value, min, max) {
    const normalized = (value - min) / (max - min);
    return isNaN(normalized) ? 0 : normalized;
}
