// SVG animate
// http://gionkunz.github.io/chartist-js/

'use strict';

/**
 * Panel stat directive
 *
 * @author C Killua
 * @module Konko/Client/Layout/Directives/PanelStat
 * @param $timeout - service in module ng
 * @returns {Object} Directive of panel-stat
 */
export default ($timeout) => {
  'ngInject';
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      topics: '@',
      comments: '@',
      pid: '@',
    },
    template: [
      '<div class="ct-chart ct-golden-section ct-negative-labels">',
      '<div class="c-p-s-label"><span class="l-t">{{topics}}</span>',
      '/<span class="l-c">{{comments}}</span></div></div>',
    ].join(''),
    link: (scope, element, attrs) => {
      let topics = parseInt(scope.topics);
      let comments = parseInt(scope.comments);
      let total = (topics + comments) * 1.333;
      let selector = '#panel_' + scope.pid + ' .ct-chart';
      $timeout(() => {
        if (total) {
          let chart = new Chartist.Pie(selector, {
            series: [topics, comments],
            labels: ['Topics', 'Comments'],
          }, {
            height: '5rem',
            donut: true,
            donutWidth: 1,
            startAngle: 225,
            total: total,
            showLabel: false,
          });

          chart.on('draw', data => {
            if (data.type === 'slice') {
              let pathLength = data.element._node.getTotalLength();
              data.element.attr({ 'stroke-dasharray': pathLength + 'px ' + pathLength + 'px' });
              let animationDefinition = {
                'stroke-dashoffset': {
                  id: 'anim' + data.index,
                  dur: 600,
                  from: -pathLength + 'px',
                  to:  '0px',
                  easing: Chartist.Svg.Easing.easeInOutBack,
                  fill: 'freeze',
                },
              };
              if (data.index !== 0) {
                animationDefinition['stroke-dashoffset'].begin = 'anim' + (data.index - 1) + '.end';
              }

              data.element.attr({ 'stroke-dashoffset': -pathLength + 'px' });
              data.element.animate(animationDefinition, false);
            }
          });

          element.click(() => {
            if (window.__anim21278907124) {
              clearTimeout(window.__anim21278907124);
              window.__anim21278907124 = null;
            }

            window.__anim21278907124 = setTimeout(chart.update.bind(chart), 100);
          });
        } else {
          new Chartist.Pie(selector, {
            series: [0, 0, 100],
          }, {
            height: '5rem',
            donut: true,
            donutWidth: 1,
            startAngle: 225,
            total: 133,
            showLabel: false,
          });
        }
      });
    },
  };
};
