export type MbtiType = {
  code: string;
  name: string;
  group: string;
};

export const MBTI_GROUPS = ['分析家', '外交官', '番人', '探検家'] as const;

export const MBTI_TYPES: MbtiType[] = [
  // 分析家 (Analysts)
  { code: 'INTJ', name: '建築家', group: '分析家' },
  { code: 'INTP', name: '論理学者', group: '分析家' },
  { code: 'ENTJ', name: '指揮官', group: '分析家' },
  { code: 'ENTP', name: '討論者', group: '分析家' },

  // 外交官 (Diplomats)
  { code: 'INFJ', name: '提唱者', group: '外交官' },
  { code: 'INFP', name: '仲介者', group: '外交官' },
  { code: 'ENFJ', name: '主人公', group: '外交官' },
  { code: 'ENFP', name: '運動家', group: '外交官' },

  // 番人 (Sentinels)
  { code: 'ISTJ', name: '管理者', group: '番人' },
  { code: 'ISFJ', name: '擁護者', group: '番人' },
  { code: 'ESTJ', name: '幹部', group: '番人' },
  { code: 'ESFJ', name: '領事官', group: '番人' },

  // 探検家 (Explorers)
  { code: 'ISTP', name: '巨匠', group: '探検家' },
  { code: 'ISFP', name: '冒険家', group: '探検家' },
  { code: 'ESTP', name: '起業家', group: '探検家' },
  { code: 'ESFP', name: 'エンターテイナー', group: '探検家' },
];
