const fs = require('fs');

const quotes = JSON.parse(fs.readFileSync('quotes.json', 'utf8'));

const formatted = quotes.map(q => ({
  text: q.quoteText,
  author: q.quoteAuthor
}));

fs.writeFileSync('quotes-formatted.json', JSON.stringify(formatted, null, 2));
console.log('Reformatted quotes saved to quotes-formatted.json'); 