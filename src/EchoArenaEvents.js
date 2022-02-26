const Overtime = require("./echo-arena-events/Overtime");
const RoundOver = require("./echo-arena-events/RoundOver");
const RoundStart = require("./echo-arena-events/RoundStart");
const PossessionChanged = require("./echo-arena-events/PossessionChanged");
const RoundTimeChanged = require("./echo-arena-events/RoundTimeChanged");
const ScoreChanged = require("./echo-arena-events/scoreChanged");

module.exports = [
    new Overtime(),
    new PossessionChanged(),
    new RoundOver(),
    new RoundStart(),
    new RoundTimeChanged(),
    new ScoreChanged()
]