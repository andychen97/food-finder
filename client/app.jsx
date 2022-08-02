import React from 'react';
import parseRoute from './lib/parse-route';
import Home from './pages/home';
import SearchResults from './pages/search-results';
import LogoHeader from './components/header';
import PageContainer from './components/page-container';
import ClickedRestaurant from './pages/clicked-restaurant';
import Auth from './pages/auth';
import AppContext from './lib/app-context';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: false,
      route: parseRoute(window.location.hash)
    };
  }

  componentDidMount() {
    window.addEventListener('hashchange', () => {
      this.setState({
        route: parseRoute(window.location.hash)
      });
    });
  }

  renderPage() {
    const { path } = this.state.route;
    if (path === '') {
      return <Home />;
    }
    if (path === 'search-result') {
      const params = this.state.route.params;
      return <SearchResults keyword={params.get('keyword')} location={params.get('location')} />;
    }
    if (path === 'single-result') {
      const params = this.state.route.params;
      return <ClickedRestaurant clickedId={params.get('clickedId')} />;
    }
    if (path === 'sign-up' || path === 'sign-in') {
      return <Auth />;
    }
  }

  render() {
    const { user, route } = this.state;
    const contextValue = { user, route };
    return (
      <AppContext.Provider value={contextValue}>
        <LogoHeader />
        <PageContainer>
        { this.renderPage() }
        </PageContainer>
      </AppContext.Provider>
    );
  }
}
