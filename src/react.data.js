import faker from "faker";
import Rx from "rx";
import _ from "lodash";

const EVENT_INTERVAL = 1000;

export function createGames(noOfGames = 5) {
    const games = _.range(0, noOfGames)
        .map(createGame);

    return Rx.Observable.combineLatest(...games, (...args) => args);
}

export function createGame(delay) {
    const initialGame = generateFakeGame();
    return Rx.Observable.interval(EVENT_INTERVAL)
        .flatMap((i) => {
            const $ = Rx.Observable.of(i);
            return i === 0 ? $ : $.delay(delay * 1000);
        })
        .scan((game, tick) => {
            return updateGame(game);
        }, initialGame)
        .startWith(initialGame)
}

function updateGame(game) {
    game.clock++;

    maybeUpdate(5, game, () => game.score.home++);
    maybeUpdate(5, game, () => game.score.away++);
    
    maybeUpdate(8, game, () => game.cards.yellow++);
    maybeUpdate(2, game, () => game.cards.red++);

    maybeUpdate(10, game, () => game.outrageousTackles++);

    const randomPlayerIndex = randomNum(0, 4);
    const effortLevel = randomNum();
    const invitedNextWeek = faker.random.boolean();

    game.players[randomPlayerIndex].effortLevel = effortLevel;
    game.players[randomPlayerIndex].invitedNextWeek = invitedNextWeek;
    game.players[randomPlayerIndex].version++;

    return game;
}

function generateFakeGame() {
    return {
        clock: 0,
        score: {
            home: 0,
            away: 0
        },
        teams: {
          home: faker.address.city(),  
          away: faker.address.city()  
        },
        outrageousTackles: 0,
        cards: {
            yellow: 0,
            red: 0
        },
        players: [1, 2, 3, 4, 5].map(generateFakePlayer)
    };
}

function generateFakePlayer() {
    return {
				version: 0,
        name: faker.name.findName(),
        effortLevel: randomNum(),
        invitedNextWeek: faker.random.boolean()
    }
}

function maybeUpdate(prob, game, fn) {
    const num = randomNum(0, 100);
    if (num <= prob) { fn(game); }
}

function randomNum(min, max) {
    min = min || 0;
    max = max || 10;
    return faker.random.number({
        "min": min,
        "max": max
    });
}
