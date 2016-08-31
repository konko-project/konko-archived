'use strict';

/**
 * Post directive
 *
 * @author C Killua
 * @module Konko/Client/Posts/Directives/Post
 * @param $compile - service in module ng
 * @returns {Object} Directive of konko-post
 */
export default ($compile) => {
  'ngInject';
  return {
      restrict: 'AE',
      replace: true,
      scope: {
        content: '=',
      },
      link: (scope, element, attrs) => {
        const toHTMLChar = (match, g1, ...rest) => {
          return `&#${g1.charCodeAt(0)};`;
        };
        const genHeading = (match, sharps, text, ...rest) => {
          let headNum = sharps.length;
          let id = _.kebabCase(
                    text.replace(/(<(pre|code).*?\/\2\>)|(\!?\[([^\]]*)\]\(([^\s]*?)\ ?((\'|\")(.*?)\7)?\))|(\([^\(\)]*\ color\=\'.*?\'\))/g, ' ')
                    .match(/([^\s]+\ ?)+/g)[0]
                  );
          return `<h${headNum} id="${id}">${text}</h${headNum}>`;
        };
        const genQuote = (match, g1, g2, content, ...rest) => {
          let nq = g1.match(/\>/g).length;
          return `${'<blockquote>'.repeat(nq)}${content ? content : ''}${'</blockquote>'.repeat(nq)}`;
        };
        const genList = (match, g1, g2, g3, g4, ...rest) => {
          const genItem = (content, tags, depth) => {
            if (!content) {
              return tags.reverse().map(tag => `</${tag}>`).join('');
            }
            let [item, ...rest] = content.split('\n');
            let [match, g1, g2, g3] = /^(\ *)(\d\.|\*|\-)\ ?(.*)/g.exec(item);
            let newDepth = g1.length;
            rest = rest.length ? rest.join('\n') : '';
            if (newDepth === depth) {
              return `<li>${g3}</li>${genItem(rest, tags, newDepth)}`;
            } else if (newDepth > depth) {
              let tag = g2.length === 1 ? 'ul' : 'ol';
              tags.push(tag);
              return `<${tag}><li>${g3}</li>${genItem(rest, tags, newDepth)}`;
            } else {
              let tag = tags.pop(tags);
              return `</${tag}><li>${g3}</li>${genItem(rest, tags, newDepth)}`;
            }
          };
          let tag = g4.length === 1 ? 'ul' : 'ol';
          let content = g1.match(/^(\ *)(\d\.|\*|\-)\ ?(([\s\S](?!^\ *(?:\d\.|\*|\-)))*)$/gm).map(s => s.replace('\n', '<br />')).join('\n');
          return `<${tag}>${genItem(content, [], 0)}</${tag}>`;
        };
        const genCode = (match, g1, g2, g3, ...rest) => {
          return `<code>${g3.replace(/(\\|\`|\*|\_|\{|\}|\[|\]|\(|\)|\#|\+|\-|\.|\!|\ |\~|<|\>|\:|\/)/gm, toHTMLChar).replace(/\n/gm, '<br />')}</code>`;
        };
        const genCodeBlock = (match, g1, g2, g3, ...rest) => {
          return `<pre title="${g2}" class="b-a-1-d"><code lang="${g2}">${g3.replace(/(\\|\`|\*|\_|\{|\}|\[|\]|\(|\)|\#|\+|\-|\.|\!|\ |\~|<|\>|\:|\/)/gm, toHTMLChar).replace(/\n/gm, '<br />')}</code></pre>`;
        };
        const genImage = (match, alt, src, g3, g4, title) => {
          return `<img alt="${alt}" src="${_.escape(src)}" title="${title || alt}">`;
        };
        const genLink = (match, text, url, g3, title, ...rest) => {
          let target = url.match(/(ht|f)tps?:\/\//g) ? '_blank' : '_self';
          let absUrl = url[0] === '#' ? `${window.location.pathname}${url}` : url;
          return `<a href="${_.escape(absUrl)}" title="${title || ''}" target="${target}">${text || absUrl}</a>`;
        };

        let result = scope.content
                            // code
                            .replace(/(^\`{3,})\ ?([^\`]*?)\n(([\s\S])*?)\1/gm, genCodeBlock)               // block code
                            .replace(/((\`{1,})(([\s\S])*?)\2)/gm, genCode)                                 // inline code
                            // paragraphing
                            .replace(/^(#{1,6})\ (.*)/gm, genHeading)                                       // heading
                            .replace(/^(.*)$\n(?:-|=){3,}$/gm, '<h1>$1</h1>')                               // h1
                            .replace(/^((\*|\-|\_)\ ?){3,}$/gm, '<hr />')                                   // horizontal line
                            .replace(/((^(\ *(\d\.|\*|\-)\ ).*\n(\ *[\S]+\n?)*)+)/gm, genList)              // Listing
                            .replace(/(?:(?!\>\ ?))(?:--(.*))$/gm, '<footer class="blockquote-footer">$1</footer>') // quote source
                            // Escaping characters
                            .replace(/\\(\\|\`|\*|\_|\{|\}|\[|\]|\(|\)|\#|\+|\-|\.|\!|\ |\~)/gm, toHTMLChar)
                            // text styling
                            .replace(/(\_\_|\*\*)(((?!\_\_|\*\*)[\s\S])*)\1/gm, '<strong>$2</strong>')      // **txt** || __txt__
                            .replace(/(\_|\*)(((?!\_|\*)[\s\S])*)\1/gm, '<em>$2</em>')                      // _text_ || *text*
                            .replace(/(\~\~)(((?!\~\~)[\s\S])*)\1/gm, '<del>$2</del>')                      // ~~txt~~
                            .replace(/(?:\(([^\(]*)(?:\ |\n)color\=\'(.*?)\'\))/gm, '<span style="color: $2">$1</span>')  // (text color='color')
                            // links and images
                            .replace(/(?!(\[[^\]]*?\]\([^\)]*?))<?((?:(?:magnet:\?)|(?:(?:ht|f)tps?:\/\/))(?:[^\s\><\)\"\'])*(()))\>?(?![^\(]*?\))/gm, genLink)
                            .replace(/\!\[([^\]]*)\]\(([^\s]*?)\ ?((\'|\")(.*?)\4)?\)/gm, genImage)         // ![alt](link 'title')
                            .replace(/\[([^\[]*)\]\(([^\s]*?)\ ?(?:(\'|\")([^\[]*?)\3)?\)/gm, genLink);     // [Text](link 'title')

        result = _.map(result.split('\n'), i => {
          return i.match(/^\>\ ?/g) ? i.trim().replace(/&gt;/g, '>').replace(/^((\>\ ?){1,})(.*)/g, genQuote) : i;
        }).join('\n');
        while (result.match(/(<\/(blockquote)\>)\n(<\2\>)/gm)) {
          result = result.replace(/(<\/(blockquote)\>)\n(<\2\>)/gm, '\n');
        }

        result = result.replace(/\n/gm, '<br />');

        element.html(result);
        $compile(element.contents())(scope);
      },
  };
};
