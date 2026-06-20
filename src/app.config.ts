export default defineAppConfig({
  pages: [
    'pages/calendar/index',
    'pages/today/index',
    'pages/mine/index',
    'pages/addManga/index',
    'pages/mangaDetail/index',
    'pages/hiatusRecord/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#7B61FF',
    navigationBarTitleText: '追更日历',
    navigationBarTextStyle: 'white',
    backgroundColor: '#FAF9FF'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#7B61FF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/calendar/index',
        text: '日历'
      },
      {
        pagePath: 'pages/today/index',
        text: '今天可看'
      },
      {
        pagePath: 'pages/mine/index',
        text: '书架'
      }
    ]
  }
})
