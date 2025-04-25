import type { Config } from "tailwindcss";
import animatePlugin from 'tailwindcss-animate';
import colors from 'tailwindcss/colors';

export default {
	darkMode: ["class"],
	content: [
		"./src/**/*.{ts,tsx,css}",
		"./src/index.css",
		"./pages/**/*.{ts,tsx,css}",
		"./components/**/*.{ts,tsx,css}",
		"./app/**/*.{ts,tsx}",
	],
	prefix: "",
	safelist: [
		'border-border',
		'bg-rose', 'text-rose', 'border-rose', 'hover:bg-rose', 'hover:bg-rose/90', 'hover:text-rose',
		'bg-cream', 'text-cream', 'border-cream',
		'bg-charcoal', 'text-charcoal', 'border-charcoal',
		'bg-taupe', 'text-taupe', 'border-taupe',
		'bg-blush', 'text-blush', 'border-blush',
		'bg-lavender', 'text-lavender', 'border-lavender',
		{ pattern: /^(bg|text|border|hover:|focus:|active:)[\w\-/]+$/ }
	],
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
				cream:     'hsl(var(--cream))',
				charcoal:  'hsl(var(--charcoal))',
				taupe:     'hsl(var(--taupe))',
				blush:     'hsl(var(--blush))',
				lavender:  'hsl(var(--lavender))',
				rose:      'hsl(var(--rose))',
				accent:    'var(--accent)',
				border:    'var(--border)',
				input:     'var(--input)',
				ring:      'var(--ring)',
				background:'var(--background)',
				foreground:'var(--foreground)',
				gray:   colors.gray,
				blue:   colors.blue,
				green:  colors.green,
				pink:   colors.pink,
				primary: {
					DEFAULT: 'var(--primary)',
					foreground: 'var(--primary-foreground)'
				},
				secondary: {
					DEFAULT: 'var(--secondary)',
					foreground: 'var(--secondary-foreground)'
				},
				destructive: {
					DEFAULT: 'var(--destructive)',
					foreground: 'var(--destructive-foreground)'
				},
				muted: {
					DEFAULT: 'var(--muted)',
					foreground: 'var(--muted-foreground)'
				},
				popover: {
					DEFAULT: 'var(--popover)',
					foreground: 'var(--popover-foreground)'
				},
				card: {
					DEFAULT: 'var(--card)',
					foreground: 'var(--card-foreground)'
				},
				sidebar: {
					DEFAULT: 'var(--sidebar-background)',
					foreground: 'var(--sidebar-foreground)',
					primary: 'var(--sidebar-primary)',
					'primary-foreground': 'var(--sidebar-primary-foreground)',
					accent: 'var(--sidebar-accent)',
					'accent-foreground': 'var(--sidebar-accent-foreground)',
					border: 'var(--sidebar-border)',
					ring: 'var(--sidebar-ring)'
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
				'blush-gradient': 'linear-gradient(to right, #7E69AB, #9F8BC3)',
			},
		}
	},
	plugins: [animatePlugin],
} satisfies Config;
