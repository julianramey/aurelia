import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		fontFamily: {
			sans: ['Inter', 'sans-serif'],
			display: ['Playfair Display', 'serif'],
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
                cream: '#FFFCF9',
                blush: '#F4D8D8',
                lavender: '#E5DAF8',
                charcoal: '#1E1E1E',
                taupe: '#8B7E74',
                rose: '#E27D87',
                sage: '#DCE7D8',
                peach: '#FEE3D6',
                glow: {
                    purple: '#9b87f5',
                    'dark-purple': '#1A1F2C',
                    'secondary-purple': '#7E69AB',
                    'tertiary-purple': '#6E59A5',
                    'vivid-purple': '#8B5CF6',
                    'light-purple': '#D6BCFA',
                    'soft-purple': '#E5DEFF',
                    'neutral-gray': '#8E9196',
                    'soft-pink': '#FFDEE2',
                    'magenta-pink': '#D946EF',
                    'soft-peach': '#FDE1D3',
                    'bright-orange': '#F97316',
                    'soft-green': '#F2FCE2',
                    'soft-blue': '#D3E4FD',
                    'ocean-blue': '#0EA5E9',
                    'soft-yellow': '#FEF7CD',
                },
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					"0%": {
						opacity: "0",
						transform: "translateY(10px)"
					},
					"100%": {
						opacity: "1",
						transform: "translateY(0)"
					}
				},
				'fade-out': {
					"0%": {
						opacity: "1",
						transform: "translateY(0)"
					},
					"100%": {
						opacity: "0",
						transform: "translateY(10px)"
					}
				},
				'scale-in': {
					"0%": {
						transform: "scale(0.95)",
						opacity: "0"
					},
					"100%": {
						transform: "scale(1)",
						opacity: "1"
					}
				},
				'glow': {
					"0%": {
						boxShadow: "0 0 5px rgba(244, 216, 216, 0.3)"
					},
					"50%": {
						boxShadow: "0 0 20px rgba(244, 216, 216, 0.6)"
					},
					"100%": {
						boxShadow: "0 0 5px rgba(244, 216, 216, 0.3)"
					}
				},
				'float': {
					"0%": {
						transform: "translateY(0)"
					},
					"50%": {
						transform: "translateY(-10px)"
					},
					"100%": {
						transform: "translateY(0)"
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'fade-out': 'fade-out 0.5s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'glow': 'glow 2s infinite ease-in-out',
				'float': 'float 6s infinite ease-in-out',
				'float-slow': 'float 8s infinite ease-in-out',
				'entrance': 'fade-in 0.7s ease-out, scale-in 0.5s ease-out'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'glass-gradient': 'linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.3))',
				'blush-gradient': 'linear-gradient(to right, #F4D8D8, #FEE3D6)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
