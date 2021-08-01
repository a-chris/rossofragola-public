import { Flex, Heading } from '@chakra-ui/core';
import { Footer } from 'client/components';
import Link from 'next/link';
import React from 'react';
import colors from 'styles/colors';

export default function CustomErrorPage(props) {
    return (
        <Flex h='100%' justify='center' align='center' direction='column' backgroundColor={colors.white_dirty}>
            <Heading mb='40px' textAlign='center'>
                Ops, qualcosa è andato storto!
            </Heading>
            <Link href='/'>
                <a>Torna alla pagina principale</a>
            </Link>
            <Footer w='100%' position='absolute' bottom='0' />
        </Flex>
    );
}
