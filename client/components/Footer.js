import { Flex, Image, Text } from '@chakra-ui/core';
import React from 'react';
import styled from 'styled-components';
import colors from 'styles/colors';

function Footer(props) {
    return (
        <Flex
            height='80px'
            justify='center'
            align='center'
            backgroundColor={colors.red_light}
            color={colors.black_light}
            {...props}>
            <Flex backgroundColor={colors.red_light} justify='center' align='center' borderRadius='30px'>
                <Image size='30px' src='favicon.png' alt='strawberry' mr='10px' />
                <Text fontSize='lg' pr='10px'>
                    Rosso Fragola - 2020
                </Text>
            </Flex>
        </Flex>
    );
    // TODO
    // return (
    //     <Box height='80px' position='relative' bottom='0' backgroundColor={colors.red_light}>
    //         <Grid templateColumns='repeat(3,1fr)' justifyItems='center'>
    //             <Box>
    //                 <Text>Contenuto</Text>
    //                 <Text>Contenuto</Text>
    //                 <Text>Contenuto</Text>
    //             </Box>
    //             <Box>
    //                 <Text>Contenuto</Text>
    //                 <Text>Contenuto</Text>
    //                 <Text>Contenuto</Text>
    //             </Box>
    //             <Box>
    //                 <Text>Contenuto</Text>
    //                 <Text>Contenuto</Text>
    //                 <Text>Contenuto</Text>
    //             </Box>
    //         </Grid>
    //     </Box>
    // );
}

const StyledFooter = styled(Footer).attrs({
    className: 'pattern-diagonal-lines-sm',
})`
    & * {
        font-family: 'Just Another Hand' !important;
        letter-spacing: 2px !important;
    }
`;

export default StyledFooter;
