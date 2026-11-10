import { render } from 'preact';
import './design-system/tokens.css';
import './design-system/base.css';
import { App } from './app/App';
import { applyTheme, initialPrefs } from './services/prefs';

applyTheme(initialPrefs().theme);
render(<App />, document.getElementById('app')!);
