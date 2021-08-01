import { RECIPE_TYPE } from 'model/models';
import { findIngredientsMatches } from 'server/repository/neo4j';

const recipe_types = new Set(Object.values(RECIPE_TYPE));

export default async (req, res) => {
    const { body } = req;
    if (body == null) {
        return res.status(400).json({ error: 'Missing request body' });
    }
    const data = JSON.parse(body);
    const { ingredients, type } = data;
    if (ingredients.length === 0) {
        return res.status(400).json({ error: 'Missing ingredients ids' });
    }
    if (type == null || type === '' || !recipe_types.has(type)) {
        return res.status(400).json({ error: 'Missing type' });
    }
    const matches = await findIngredientsMatches(ingredients, type);
    res.status(200).json({ matches: JSON.stringify(matches) });
};
