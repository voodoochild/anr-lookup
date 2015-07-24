# ANR Lookup

Prototype lookup engine for Android:Netrunner using card data from NetrunnerDB.

Attempts to find tokens in a query string to match against specific JSON fields,
falling back to a text search on the card title, e.g. "hb bioroid 2 inf" will return
all "bioroid" subtype cards in the "haas-bioroid" faction with a cost of 2 influence.

## Todo

Probably a good idea to do both token–matching *and* a full–text search, then
combining (and deduplicating) results in order to provide the best chance of
returning the correct cards.
