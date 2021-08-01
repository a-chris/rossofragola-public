import { Box, Button, Flex, Grid, Heading, Radio, RadioGroup, Stack, Text } from '@chakra-ui/core';
import { matchIngredients } from 'client/api/api';
import { Cover, CustomSelect, CustomTag, Footer, LoadingSpinner } from 'client/components';
import { SITE_NAME } from 'client/constant';
import { mapAffinity } from 'client/utils/misc';
import { motion } from 'framer-motion';
import _ from 'lodash';
import { RECIPE_TYPE } from 'model/models';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { TiStarFullOutline, TiStarHalfOutline, TiStarOutline } from 'react-icons/ti';
import Slider from 'react-slick';
import { useMedia } from 'react-use';
import { getIngredientsList, getSuggestionsList } from 'server/repository/neo4j';
import colors from 'styles/colors';
import * as styles from 'styles/Home.module.css';

function reducer(state, action) {
    switch (action.type) {
        case 'FROM_URL': {
            const { recipeType, codes } = action;
            return { ...state, recipeType, codes };
        }
        case 'SET_RECIPE_TYPE': {
            const { recipeType } = action;
            return { ...state, recipeType };
        }
        case 'ADD_INGREDIENT': {
            const { code } = action;
            return { ...state, codes: [...(state.codes || []), code] };
        }
        case 'REMOVE_INGREDIENT': {
            const { code } = action;
            return { ...state, codes: _.without(state.codes, code) };
        }
        default:
            throw new Error();
    }
}

const INITAL_STATE = { recipeType: RECIPE_TYPE.BOTH, codes: null };

export default function Home({ ingredients, suggestions }) {
    const router = useRouter();
    const [currentIngredient, setCurrentIngredient] = React.useState();
    const [matches, setMatches] = React.useState(null);
    const [isLoading, setLoading] = React.useState(false);

    const startingMatchesRef = React.useRef();

    const [state, dispatch] = React.useReducer(reducer, { recipeType: RECIPE_TYPE.BOTH, codes: null });

    React.useEffect(() => {
        const { recipe, ingredients } = router.query;
        if (recipe != null && ingredients != null && _.isEqual(state, INITAL_STATE)) {
            const urlCodes = ingredients?.split(',')?.map(Number);
            dispatch({ type: 'FROM_URL', recipeType: recipe, codes: urlCodes });
        }
    }, [router.query, state]);

    React.useEffect(() => {
        const { ingredients } = router.query;
        const urlCodes = ingredients?.split(',')?.map(Number);
        if (state.codes != null && _.without(state.codes, urlCodes).length > 0) {
            router.push(`/?recipe=${state.recipeType}&ingredients=${state.codes.join(',')}`, undefined, {
                shallow: true,
            });
        } else if (state.codes?.length === 0) {
            router.push('/', undefined, { shallow: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    React.useEffect(() => {
        const { recipeType, codes } = state;
        if (codes?.length > 0) {
            setLoading(true);
            matchIngredients(codes, recipeType)
                .then((result) => setMatches(result))
                .catch((err) => console.error(err))
                .finally(() => setLoading(false));
        } else {
            setMatches(null);
        }
    }, [state]);

    const onChangeRecipeType = (e) => {
        dispatch({ type: 'SET_RECIPE_TYPE', recipeType: e.target.value });
    };

    const onAddIngredient = ({ value, label }) => {
        setCurrentIngredient({ value, label });
    };

    const onRemoveIngredient = ({ code }) => {
        dispatch({ type: 'REMOVE_INGREDIENT', code: Number(code) });
    };

    const onMatch = () => {
        if (currentIngredient != null) {
            setCurrentIngredient(null); // reset the search
            dispatch({ type: 'ADD_INGREDIENT', code: Number(currentIngredient.value) });
        }
    };

    const onMatchCardClick = ({ code }) => {
        dispatch({ type: 'ADD_INGREDIENT', code: Number(code) });
        startingMatchesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const ingredientsOptions = React.useMemo(() => {
        return ingredients.map((ingr) => ({ value: ingr.code.toString(), label: ingr.name }));
    }, [ingredients]);

    const selectedIngredients = React.useMemo(() => {
        const codes = new Set(state.codes);
        return ingredients.filter((i) => codes.has(i.code));
    }, [ingredients, state.codes]);

    const matchesWithLowAffinity = React.useMemo(() => matches?.filter((m) => m.affinity === 0), [matches]);

    const matchesWithHighAffinity = React.useMemo(() => matches?.filter((m) => m.affinity > 0), [matches]);

    const ingredientsText = React.useMemo(() => {
        return selectedIngredients?.length > 0
            ? selectedIngredients.map((i) => i.name).join(', ')
            : 'centinaia di ingredienti.';
    }, [selectedIngredients]);

    const title = React.useMemo(() => {
        return `${SITE_NAME} - Migliori ingredienti con ${ingredientsText}`;
    }, [ingredientsText]);

    const description = React.useMemo(() => {
        return `${SITE_NAME} ti aiuta a migliorare le tue ricette! Scopri cosa puoi cucinare con  ${ingredientsText}`;
    }, [ingredientsText]);

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name={description} description={description} content={description} />
            </Head>
            <Flex className={styles.container}>
                <Flex className={styles.main_container} backgroundColor={colors.white_dirty}>
                    <Cover>
                        <Heading className={styles.title} as='h1' fontSize='5rem'>
                            {SITE_NAME}
                        </Heading>
                        {/* <Heading
                            className={styles.subtitle}
                            as='h2'
                            fontSize={['1.5rem', '1.75rem', null, '2rem']}
                            p='0px 30px 80px 30px'>
                            Fatti ispirare trovando gli ingredienti più affini
                        </Heading> */}
                        <Box>
                            <Flex align='center' justify='center' pt='10px'>
                                <motion.div
                                    initial={{ width: 100, maxWidth: 500 }}
                                    animate={{ width: '100%' }}
                                    transition={{ ease: 'easeOut', duration: 2 }}>
                                    <CustomSelect
                                        onChange={onAddIngredient}
                                        options={ingredientsOptions}
                                        value={currentIngredient}
                                        placeholder='Cerca un ingrediente...'
                                    />
                                </motion.div>
                                <MatchButton ml='5px' onClick={onMatch} />
                            </Flex>
                            <RadioGroup
                                isInline
                                pt='15px'
                                color='white'
                                variantColor='red'
                                size='lg'
                                defaultValue='both'
                                fontWeight='bold'
                                textShadow='1px black'
                                onChange={onChangeRecipeType}
                                value={state.recipeType}>
                                <RecipeTypeRadio value={RECIPE_TYPE.SALTY}>Salato</RecipeTypeRadio>
                                <RecipeTypeRadio value={RECIPE_TYPE.SWEET}>Dolce</RecipeTypeRadio>
                                <RecipeTypeRadio value={RECIPE_TYPE.BOTH}>Entrambi</RecipeTypeRadio>
                            </RadioGroup>
                        </Box>
                    </Cover>
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : matches == null ? (
                        <Presentation suggestions={suggestions} />
                    ) : matches.length === 0 ? (
                        <EmptyMessage />
                    ) : (
                        <Box className='p1' pb='40px'>
                            {selectedIngredients?.length > 0 && (
                                <Flex
                                    align='center'
                                    justify='center'
                                    m='auto'
                                    mt='20px'
                                    wrap='wrap'
                                    maxW={['90%', '80%', '60%']}>
                                    {selectedIngredients.map((i) => (
                                        <CustomTag key={i.name} onClose={() => onRemoveIngredient(i)}>
                                            {i.name}
                                        </CustomTag>
                                    ))}
                                </Flex>
                            )}
                            <Text ref={startingMatchesRef} fontSize='2xl' textAlign='center' p='2' pt='8'>
                                {`Ecco i migliori cibi da mangiare con ${ingredientsText}`}
                            </Text>
                            <Text ref={startingMatchesRef} fontSize='2xl' textAlign='center' p='2' pt='1'>
                                Continua a scegliere gli ingredienti fino a trovare l'abbinamento giusto!
                            </Text>
                            {matchesWithHighAffinity.length > 0 && (
                                <>
                                    <Text fontSize='2xl' textAlign='center' p='2' pt='3'>
                                        Ti consigliamo:
                                    </Text>
                                    <GridContent m='30px auto'>
                                        {matchesWithHighAffinity.map((match) => (
                                            <MatchCard match={match} key={match.code} onClick={onMatchCardClick} />
                                        ))}
                                    </GridContent>
                                </>
                            )}
                            {matchesWithLowAffinity.length > 0 && (
                                <>
                                    <Text fontSize='2xl' textAlign='center' p='2' pt='8'>
                                        Abbinamenti meno frequenti:
                                    </Text>
                                    <GridContent m='10px auto 0 auto'>
                                        {matchesWithLowAffinity.map((match) => (
                                            <MatchCard
                                                match={match}
                                                hideStars
                                                key={match.code}
                                                onClick={onMatchCardClick}
                                            />
                                        ))}
                                    </GridContent>
                                </>
                            )}
                        </Box>
                    )}
                </Flex>
                <Footer />
            </Flex>
        </>
    );
}

function Presentation({ suggestions }) {
    const isDesktop = useMedia('(min-width: 1025px)');

    return (
        <>
            <Stack h='fit-content' my='30px'>
                <Box maxW={['90%', '80%', '60%']} m='auto' textAlign='center'>
                    <Text fontSize={['xl', '2xl', '3xl']}>
                        Sei alla ricerca del piatto perfetto o semplicemente curioso di provare nuovi ingredienti?
                    </Text>
                    <Text fontSize={['xl', '2xl', '3xl']} mt={['10px', '20px', '40px']}>
                        <b>🍓 {SITE_NAME}</b> utilizza migliaia di ricette italiane per proporti i migliori abbinamenti
                        di ingredienti!
                    </Text>
                </Box>
            </Stack>
            <Stack w={['100%', '90%', '80%']} minH='500px' h='fit-content' m='auto' mb='30px'>
                <Slider dots autoplay speed={500} autoplaySpeed={8000} arrows={isDesktop}>
                    {suggestions.map((s, idx) => (
                        <Box h='fit-content' key={idx}>
                            <Text fontSize='2xl' textAlign='center' p='10px'>
                                {s.text}
                            </Text>
                            <Grid
                                maxW={['90%', '80%', '60%']}
                                templateColumns={['repeat(2, 1fr)', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
                                gap={['1rem', '2rem']}
                                mx='auto'
                                my='20px'
                                px='20px'>
                                {s.matches.map((match) => (
                                    <MatchCard match={match} key={match.code} />
                                ))}
                            </Grid>
                        </Box>
                    ))}
                </Slider>
            </Stack>
        </>
    );
}

function EmptyMessage() {
    return (
        <Box m='auto'>
            <Text fontSize='3xl'>Ops, sembra che questo abbinamento non possa proprio funzionare!</Text>
        </Box>
    );
}

function RecipeTypeRadio({ children, ...props }) {
    return (
        <Radio textShadow='1px 1px 1px #242120, 5px 10px 50px #242120' {...props}>
            {children}
        </Radio>
    );
}

function GridContent({ children, ...props }) {
    return (
        <Grid
            templateColumns={['repeat(1, 1fr)', 'repeat(3, 1fr)', 'repeat(4, 1fr)']}
            gap={['1rem', null, '2rem']}
            maxW={['90%', '80%', '60%']}
            {...props}>
            {children}
        </Grid>
    );
}

function MatchButton({ onClick }) {
    return (
        <Button
            size='lg'
            borderRadius='4px'
            backgroundColor='white'
            boxShadow={`0 0 1px 3px ${colors.red_strong}`}
            ml={['5px', '10px', '20px']}
            onClick={onClick}>
            Abbina
        </Button>
    );
}

const MatchCard = ({ match, hideStars = false, onClick }) => {
    const affinity = React.useMemo(() => mapAffinity(match.affinity), [match.affinity]);

    return (
        <Stack
            key={match.code}
            className={styles.match_card}
            minH='60px'
            alignItems='center'
            justifyContent='center'
            p='2'
            borderWidth='3px'
            backgroundColor='white'
            borderStyle='dashed'
            borderColor='red.400'
            borderRadius='10px'
            onClick={() => onClick?.(match)}
            cursor={onClick ? 'pointer' : 'default'}>
            <Heading as='h4' size='md' fontWeight='semibold' textAlign='center'>
                {match.name}
            </Heading>
            {!hideStars && (
                <>
                    <Box d='flex' mt='1' alignItems='center'>
                        {_.range(0, 5).map((i) => (
                            <StarIcon key={i} position={i} affinity={affinity} />
                        ))}
                    </Box>
                    <Text color={colors.black}>{`Affinità: ${affinity}`}</Text>
                </>
            )}
        </Stack>
    );
};

const StarIcon = ({ affinity, position }) => {
    const rest = affinity - position;
    const starIcon = rest >= 1 ? TiStarFullOutline : rest < 0 ? TiStarOutline : TiStarHalfOutline;
    return <Box as={starIcon} color='goldenrod' />;
};

export async function getStaticProps(context) {
    const ingredients = await getIngredientsList();
    const suggestions = await getSuggestionsList();

    return {
        props: {
            ingredients,
            suggestions,
        },
    };
}
