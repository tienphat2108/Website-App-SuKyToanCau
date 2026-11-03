/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        raised: 'rgb(var(--color-raised) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'accent-strong': 'rgb(var(--color-accent-strong) / <alpha-value>)',
        'accent-soft': 'rgb(var(--color-accent-soft) / <alpha-value>)',
        gold: 'rgb(var(--color-gold) / <alpha-value>)',
        'gold-soft': 'rgb(var(--color-gold-soft) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        inverse: 'rgb(var(--color-inverse) / <alpha-value>)',
        night: 'rgb(var(--color-night) / <alpha-value>)',
        'night-soft': 'rgb(var(--color-night-soft) / <alpha-value>)',
      },
      /*
       * Bộ phông chữ biên tập: Merriweather cho tiêu đề, Source Serif 4 cho nội dung,
       * Be Vietnam Pro cho các thành phần điều khiển.
       * Biến CSS do next/font sinh ra giúp dùng đúng tệp đã tự lưu trữ, không gọi Google Fonts lúc chạy.
       */
      fontFamily: {
        display: ['var(--font-display)', 'Merriweather', 'Georgia', 'Times New Roman', 'serif'],
        body: ['var(--font-body)', '"Source Serif 4"', 'Georgia', 'Times New Roman', 'serif'],
        ui: ['var(--font-ui)', '"Be Vietnam Pro"', 'system-ui', '"Segoe UI"', 'sans-serif'],
        sans: ['var(--font-ui)', '"Be Vietnam Pro"', 'system-ui', '"Segoe UI"', 'sans-serif'],
        mono: ['Consolas', '"Courier New"', 'monospace'],
      },
      /*
       * Thang cỡ chữ lấy 18px làm gốc đọc chính (1.125rem) và giãn dòng 1.75,
       * đồng thời nhích các bậc lớn hơn để giữ phân cấp thị giác rõ ràng.
       */
      fontSize: {
        base: ['1.125rem', { lineHeight: '1.75' }],
        lg: ['1.25rem', { lineHeight: '1.75rem' }],
        xl: ['1.375rem', { lineHeight: '1.75rem' }],
      },
      maxWidth: {
        content: '78rem',
        prose: '45rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem',
      },
      boxShadow: {
        /*
         * Bóng đổ nhẹ, một lớp, phù hợp với nền giấy ấm.
         * Tránh kết hợp viền mảnh với bóng lớn vì tạo cảm giác nặng và thiếu tự nhiên.
         */
        card: '0 1px 2px rgb(20 29 39 / 0.04), 0 8px 20px -18px rgb(20 29 39 / 0.28)',
        lift: '0 2px 4px rgb(20 29 39 / 0.05), 0 16px 30px -22px rgb(20 29 39 / 0.32)',
        glow: '0 8px 20px -14px rgb(163 46 46 / 0.40)',
        night: '0 16px 40px -30px rgb(9 14 20 / 0.55)',
      },
      backgroundImage: {
        'paper-grid':
          'linear-gradient(to right, rgb(var(--color-line) / 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--color-line) / 0.3) 1px, transparent 1px)',
        'gold-line':
          'linear-gradient(90deg, transparent, rgb(var(--color-gold) / 0.55), transparent)',
        'ink-fade':
          'linear-gradient(180deg, rgb(var(--color-night) / 0) 0%, rgb(var(--color-night) / 0.88) 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '180% 0' },
          '100%': { backgroundPosition: '-80% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '0.9' },
        },
      },
      animation: {
        'fade-up': 'fade-up 700ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 600ms ease-out both',
        float: 'float 7s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 5s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
