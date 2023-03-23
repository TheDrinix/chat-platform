// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from "vuetify";
import type { ThemeDefinition } from "vuetify";

const customDarkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#202225',
    surface: '#16171a',
    primary: '#ff0059',
    'primary-darken-1': '#b20059',
    secondary: '#fe0055',
    'secondary-darken-1': '#cb004e',
    error: '#C90007',
    success: '#1ABF03',
    warning: '#FCA300',
    info: '#13CBFA'
  }
}

export default createVuetify({
  theme: {
    defaultTheme: 'customDarkTheme',
    themes: {
      customDarkTheme
    }
  },
  display: {
    thresholds: {
      xs: 0,
      sm: 580,
      md: 768,
      lg: 960,
      xl: 1200
    }
  }
})
