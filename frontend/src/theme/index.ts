import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  components: {
    // A regra para o MuiTextField já é suficiente e se aplica a todos
    MuiTextField: {
      defaultProps: {
        inputProps: {
          autoComplete: 'off',
        },
      },
    },
    // O bloco MuiAutocomplete foi removido, pois estava incorreto e causava o erro.
  },
});