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
    primary: '#b300ff',
    'primary-darken-1': '#7d00b2',
    secondary: '#fe005e',
    'secondary-darken-1': '#cb004b',
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
  }
})
