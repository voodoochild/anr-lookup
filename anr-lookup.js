var ANRLookup = function () {
    this.cards = [];
    this.types = [];
    this.subtypes = [];
    this.factions = {
        'neutral': 'neutral',
        'haas-bioroid': 'haas-bioroid',
        'haas': 'haas-bioroid',
        'hb': 'haas-bioroid',
        'nbn': 'nbn',
        'jinteki': 'jinteki',
        'weyland-consortium': 'weyland-consortium',
        'weyland': 'weyland-consortium',
        'criminal': 'criminal',
        'crim': 'criminal',
        'shaper': 'shaper',
        'anarch': 'anarch'
    };

    return new Promise(function (resolve, reject) {
        fetch('cards.json').then(function (response) {
            return response.json();
        }).then(function (response) {
            this.cards = response;
            this.__init();
            resolve(this);
        }.bind(this)).catch(function (error) {
            reject(error);
        });
    }.bind(this));
};

ANRLookup.prototype.__init = function () {
    this.cards.map(function (card) {
        var tmp, i;

        tmp = card.type_code.split(' - ');
        for (i = 0; i < tmp.length; i++) {
            if (tmp[i].length && this.types.indexOf(tmp[i]) === -1) this.types.push(tmp[i]);
        }

        tmp = card.subtype_code.split(' - ');
        for (i = 0; i < tmp.length; i++) {
            if (tmp[i].length && this.subtypes.indexOf(tmp[i]) === -1) this.subtypes.push(tmp[i]);
        }
    }.bind(this));
};

ANRLookup.prototype.__findTokens = function (q) {
    var tokens = {};
    var tmp;

    q = q.toLowerCase();

    // Factions
    tmp = q.match(new RegExp('(' + Object.keys(this.factions).join('|') + ')', 'i'));
    if (tmp) {
        tokens.faction_code = this.factions[tmp[1].toLowerCase()];
        q = q.replace(tmp[0], '').trim();
    }

    // Agenda
    tmp = q.match(/([1-9*]{1})\/([0-6*]{1})/);
    if (tmp && tmp.length === 3) {
        if (tmp[1] !== '*') tokens.advancementcost = parseInt(tmp[1], 10);
        if (tmp[2] !== '*') tokens.agendapoints = parseInt(tmp[2], 10);
        q = q.replace(tmp[0], '').trim();
    }

    // Type
    tmp = q.match(new RegExp('(' + this.types.join('|') + ')', 'i'));
    if (tmp) {
        tokens.type_code = tmp[1];
        q = q.replace(tmp[0], '').trim();
    }

    // Sub–type
    tmp = q.match(new RegExp('(' + this.subtypes.join('|') + ')', 'i'));
    if (tmp) {
        tokens.subtype_code = tmp[1];
        q = q.replace(tmp[0], '').trim();
    }

    // Influence
    tmp = q.match(/([0-5]{1})\sinf(luence)?/i);
    if (tmp) {
        tokens.factioncost = tmp[1];
        q = q.replace(tmp[0], '').trim();
    }

    // @TODO Uniqueness
    // @TODO Set

    return [q, tokens];
};

ANRLookup.prototype.search = function (q) {
    var results = [];
    var tokensCompiled = {};
    var tmp, qAltered, tokens, tokenMatches, textMatches, t, r, qTest;

    // @TODO So much nicer with ES6 unpacking
    tmp = this.__findTokens(q);
    qAltered = tmp[0];
    tokens = tmp[1];
    if (qAltered.length) tokens.title = qAltered;

    // Precompile tests for each token
    for (t in tokens) {
        tokensCompiled[t] = new RegExp(tokens[t], 'i');
    }
    tokenMatches = this.cards.map(function (card) {
        var yay = true;
        for (t in tokensCompiled) {
            if (!yay) return;
            yay = tokensCompiled[t].test(card[t]);
        }
        return yay ? card : false;
    }).filter(function (card) {
        return !!card;
    });

    // 'Full–text' search on card text
    qTest = new RegExp(q, 'i');
    textMatches = this.cards.map(function (card) {
        return qTest.test([
            card.illustrator,
            card.text,
            card.title,
            card.type,
            card.setname,
            card.faction
        ].join('|')) ? card : false;
    }).filter(function (card) {
        return !!card;
    });

    // Combine, dedupe, and sort the results
    [].concat(tokenMatches, textMatches).forEach(function (item) {
        if (results.indexOf(item) < 0) {
            results.push(item);
        }
    });
    results.sort(function (a, b) {
        if (a.title > b.title) return 1;
        if (a.title < b.title) return -1;
        return 0;
    });

    // @TODO Come up with a better return format
    return [tokens, results];
};
