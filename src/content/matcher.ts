// Keyword matching. Pure logic, NO DOM, so it can be tested in Node.
// Owner: Claude (you'll extend it later)
//
// TODO:
// - normalize(text): lowercase, strip accents, punctuation -> single spaces
// - createMatcher(settings, terms): returns (text) => MatchResult
//   strict mode:   context term OR two different weak terms
//   spoilers mode: the above AND a spoiler term
//   customTerms always block, whitelistTerms never block

export {};
