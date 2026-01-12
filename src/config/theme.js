export const theme = {
  token: {
    colorPrimary: '#ea4544',        // Màu chủ đạo - Đỏ
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#ea4544',
    colorLink: '#ea4544',
    colorTextBase: '#262626',
    
    borderRadius: 6,
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Button: {
      controlHeight: 36,
      colorPrimaryHover: '#ff6b6a',
      colorPrimaryActive: '#d63938',
      borderRadius: 6,
      fontWeight: 500,
    },
    Table: {
      headerBg: '#fff1f0',
      headerColor: '#ea4544',
      rowHoverBg: '#fff1f0',
    },
    Menu: {
      itemSelectedBg: '#fff1f0',
      itemSelectedColor: '#ea4544',
    },
    Input: {
      activeBorderColor: '#ea4544',
      hoverBorderColor: '#ff6b6a',
    },
    Form: {
      labelColor: '#262626',
      labelFontSize: 14,
    },
  },
};
