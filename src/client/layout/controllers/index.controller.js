'use strict';

/**
 * Index Controller
 *
 * @author C Killua
 * @module Konko/Client/Layout/Controllers/Index
 */
export default class IndexController {

  /**
   * Constructor of IndexController
   *
   * @param {Array} categories - resolved categories
   * @param {Array} slides - resolved slides
   * @constructs
   */
  /*@ngInject;*/
  constructor(categories, slides) {
    // docs
    this.categories = categories && categories.length ? categories :
                      categories && categories._id ? [categories] : [];
    this.slides = slides;
  }

}
