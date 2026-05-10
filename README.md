<div align="center">

# oxide

</div>

<h6 align="center">
A minimalist colorscheme for the web.
</h6>

<p align="center">
  <a href="https://github.com/oxidescheme/userstyles/stargazers"><img src="https://img.shields.io/github/stars/oxidescheme/userstyles?colorA=161616&colorB=00a6ff&style=for-the-badge"></a>
  <a href="https://github.com/oxidescheme/userstyles/issues"><img src="https://img.shields.io/github/issues/oxidescheme/userstyles?colorA=161616&colorB=ff5655&style=for-the-badge"></a>
  <a href="https://discord.gg/p8GcbBH5MR"><img src="https://img.shields.io/discord/1450777325267456097?style=for-the-badge&color=00baaa&labelColor=161616&logo=discord&logoColor=white"></a>
</p>

Oxide userstyles bring the oxide dark theme to your favorite websites and web applications.

## Userstyles

- [Google](styles/google/)
- [DuckDuckGo](styles/duckduckgo/)
- [Hacker News](styles/hackernews/)
- [Wikipedia](styles/wikipedia/)

## Installation

Install the userstyles via [Stylus](https://github.com/openstyles/stylus) or your preferred userstyle manager. Each `.user.less` file in the `styles/` directory is a standalone userstyle.

1. Install the [Stylus](https://github.com/openstyles/stylus) browser extension
2. Find the userstyle you want in the `styles/` directory
3. Install via the provided link or copy the CSS into Stylus

## Building

```bash
bun run build
```

This compiles the Less files into CSS userstyles in the `dist/` directory.

## Linting

```bash
bun run lint
```

## Contributing

PRs welcome. Make sure colors match the palette in the [main repo](https://github.com/oxidescheme/oxide) and the [palette package](https://github.com/oxidescheme/palette).

## License

MIT License - see [LICENSE](LICENSE) for details.

<p align="center">
Copyright &copy; 2025-present oxidescheme
</p>
