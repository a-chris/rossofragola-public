import { Box } from '@chakra-ui/core';
import React from 'react';
import { createBreakpoint } from 'react-use';
import colors from 'styles/colors';

const useBreakpoint = createBreakpoint({ XL: 1800, LG: 1200, MD: 768, SM: 350 });

export default function CustomCover({ className, children }) {
    const breakpoint = useBreakpoint();
    const backgroundImage = `url("bg_${breakpoint.toLowerCase()}.jpg")`;
    return (
        <Box
            className={className}
            bg='red.400'
            textAlign='center'
            p={['1rem']}
            pt={['5rem', '6rem']}
            border={`2px solid ${colors.black_light}`}
            borderRadius='10px'
            backgroundImage={backgroundImage}
            backgroundSize='cover'
            backgroundPosition={['500px', '700px', '0', null]}
            boxShadow={`2px 2px 12px -1px ${colors.black_light}`}>
            {children}
        </Box>
    );
}
