var q = document.getElementById('q');
var tokens = document.getElementById('tokens');
var results = document.getElementById('results');

if (window.ANRLookup) {
    new ANRLookup().then(function (L) {
        q.removeAttribute('disabled');
        q.addEventListener('keyup', function () {
            if (!this.value.trim().length) {
                tokens.innerHTML = '';
                results.innerHTML = '';
                return;
            }

            var tmp = L.search(this.value);
            var key, i, l, output;

            // Show all matched tokens
            if (tmp[0]) {
                output = '';
                for (key in tmp[0]) {
                    output += '<li><b>' + key + '</b><span>' + tmp[0][key] + '</span></li>';
                }
                tokens.innerHTML = output;
            }

            // Show all matched results
            if (tmp[1]) {
                output = '';
                l = tmp[1].length;
                if (l) {
                    for (i = 0; i < l; i++) {
                        output += '<li>' + tmp[1][i].title + '</li>';
                    }
                    results.innerHTML = output;
                } else {
                    results.innerHTML = '<li>No results</li>';
                }
            }
        });
    });
}
