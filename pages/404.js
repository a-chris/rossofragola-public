import { Flex, Heading } from '@chakra-ui/core';
import Footer from 'client/components/Footer';
import Link from 'next/link';
import React from 'react';
import colors from 'styles/colors';

export default function Custom404(props) {
    return (
        <Flex h='100%' justify='center' align='center' direction='column' backgroundColor={colors.white_dirty}>
            <Heading mb='40px' textAlign='center'>
                Ops, questa pagina non esiste!
            </Heading>
            <Link href='/'>
                <a>Torna alla principale</a>
            </Link>
            <Footer w='100%' position='absolute' bottom='0' />
        </Flex>
    );
}
