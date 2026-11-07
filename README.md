<p align="center">
  <img src="public/icons/icon128.png" width="96" height="96" alt="">
</p>

<h1 align="center">Content Blocker for GTA 6</h1>

<p align="center">
  Blurs GTA 6 videos, posts and spoilers on YouTube, X and Reddit.
</p>

<p align="center">
  <a href="https://chromewebstore.google.com/detail/content-blocker-for-gta-6/agncdppnkhgpccobpilhgpdagijacjpb">Chrome Web Store</a> ·
  <a href="https://addons.mozilla.org/en-US/firefox/addon/content-blocker-for-gta-6/">Firefox Add-ons</a> ·
  <a href="https://www.youtube.com/watch?v=JkLIOEFMIPc">Video</a>
</p>

<p align="center">
  <a href="https://www.youtube.com/watch?v=JkLIOEFMIPc">
    <img src="https://img.youtube.com/vi/JkLIOEFMIPc/maxresdefault.jpg" width="640" alt="Watch the video on YouTube">
  </a>
</p>

I'm waiting for the PC version, and I didn't want the whole story spoiled by thumbnails and Reddit posts before I get to play it. So I made this.

Install it and open YouTube. Anything about GTA 6 shows up blurred: search results, recommendations, Shorts, comments, even ads. Same on X and Reddit. If you want to see one of them, click "Show anyway".

<p align="center">
  <img src="store/screenshots/1-youtube.png" width="640" alt="YouTube search results for GTA 6, all blurred">
</p>

## Settings

Click the extension icon to change how it works:

- **Strict** hides everything about the game. **Spoilers only** lets trailers and news through and only hides story stuff like endings, missions and leaks.
- **Blur** or **Hide** posts completely.
- Turn it off on one site, for example if you still want GTA news on Reddit.

On the options page you can add your own words to block (a character or mission name you heard about) or words that should never be blocked.

## How it decides

It checks the text of every video, post and comment as it loads. Something like `gta 6`, `vice city`, `leonida` or a full character name is enough to block it. Common names like `jason` or `lucia` only count when two of them show up together, so a random video about some Jason stays visible.

The keyword lists are in [`src/shared/defaults.ts`](src/shared/defaults.ts) and the per-site selectors are in [`src/content/sites.ts`](src/content/sites.ts).

## Privacy

It doesn't collect anything and makes no network requests. Your settings stay in your browser. More in [PRIVACY.md](PRIVACY.md).

## Something didn't get blurred?

YouTube, X and Reddit change their HTML all the time, so this will break now and then. [Open an issue](https://github.com/filipLeaf/gta6-content-blocker/issues) with a link to the page, or send a PR that fixes `sites.ts`. Keyword suggestions are welcome too, especially after the release.

## Building it yourself

You need Node 24.

```bash
npm install
npm run watch   # builds to dist/ and rebuilds on changes
npm test
```

Then load `dist/` as an unpacked extension in `chrome://extensions`, or `dist/manifest.json` in Firefox's `about:debugging`.

## Support

It's free. If it saved your playthrough, you can [buy me a coffee](https://buymeacoffee.com/leszkusz6).

---

MIT license. Not affiliated with Rockstar Games or Take-Two Interactive.
