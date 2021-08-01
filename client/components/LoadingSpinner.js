import { Box, Stack, Text } from '@chakra-ui/core';
import { Roller } from 'react-awesome-spinners';
import colors from 'styles/colors';

export default function LoadingSpinner() {
    return (
        <Stack minH='300px'>
            <Box m='auto' textAlign='center'>
                <Roller color={colors.red_strong} />
                <Text fontSize='xl' color={colors.red_strong}>
                    Stiamo cercando la combinazione migliore..
                </Text>
            </Box>
        </Stack>
    );
}
