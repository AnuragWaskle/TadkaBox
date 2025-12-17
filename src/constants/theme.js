export const COLORS = {
    primary: '#FA4A0C', // Vibrant Orange-Red (Foodie standard)
    secondary: '#FF9F1C', // Deep Yellow/Orange
    dark: '#000000', // Pure Black for contrast
    light: '#F5F5F8', // Light Grayish background
    white: '#FFFFFF',
    gray: '#ADADAF',
    lightGray: '#F2F2F2',
    success: '#27AE60',
    warning: '#F39C12',
    error: '#EB5757',
    text: '#333333',
    textLight: '#888888',
    overlay: 'rgba(0,0,0,0.5)',
};

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

export const SHADOWS = {
    light: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    dark: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 15,
    }
};
