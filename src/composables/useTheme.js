import { ref } from 'vue';

// 기본값: 다크 모드 (true)
const isDark = ref(true);

export function useTheme() {
  const updateDOM = () => {
    const html = document.documentElement;
    if (isDark.value) {
      html.classList.add('dark');
      html.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleTheme = () => {
    isDark.value = !isDark.value;
    updateDOM();
  };

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      isDark.value = savedTheme === 'dark';
    } else {
      // 저장된 설정이 없으면 시스템 설정 따름 (기본 다크)
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      isDark.value = true; // 프로젝트 컨셉상 기본을 다크로 고정하려면 true
    }
    updateDOM();
  };

  return {
    isDark,
    toggleTheme,
    initTheme,
  };
}
