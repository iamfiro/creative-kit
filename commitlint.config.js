module.exports = {
	extends: ['@commitlint/config-conventional'],
		rules: {
			"type-enum": [2, "always", ["feat", "fix", "docs", "style", "refactor", "test", "chore", "revert", "docs"]],
      "scope-case": [2, "always", "lower-case"],
      "scope-empty": [2, "never"],
      "scope-enum": [2, "always", [
        "react",
        "native",
        "hook",
        "lib",
        "workspace"
      ]]
		},
};