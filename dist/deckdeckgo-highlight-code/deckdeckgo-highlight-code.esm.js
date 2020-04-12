import { p as patchBrowser, b as bootstrapLazy } from './index-61c78bfe.js';
import { g as globalScripts } from './app-globals-0f993ce5.js';

patchBrowser().then(options => {
  globalScripts();
  return bootstrapLazy([["deckgo-highlight-code",[[1,"deckgo-highlight-code",{"src":[1],"anchor":[1],"anchorZoom":[1,"anchor-zoom"],"hideAnchor":[4,"hide-anchor"],"language":[513],"highlightLines":[513,"highlight-lines"],"lineNumbers":[516,"line-numbers"],"terminal":[513],"editable":[4],"editing":[32],"load":[64],"findNextAnchor":[64],"zoomCode":[64]},[[4,"prismLanguageLoaded","languageLoaded"]]]]]], options);
});
