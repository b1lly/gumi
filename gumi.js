/**
 * Gumi v0.1
 * -> usage $('sel').gumi()
 */

;(function($, window, document, undefined) {
  var defaults = {
    buttonClass: 'btn-default',
    buttonSelectedClass: 'btn-selected',
    dropdownClass: 'dropdown-default',
    onChange: function() {},
    onOpen: function() {}
  };

  /**
   * @constructor
   */
  var Gumi = function(elem, options) {
    this.elem = elem;
    this.$elem = $(elem);
    this.$elem.addClass('gumi-wrap');

    // Reference to the button that shows the current selected option
    // and also handles the click event to show the dropdown
    this.$button = $('<span />');

    // Contains a reference to the dropdown list of options
    this.$dropdown = this.$elem.find('ul').hide();

    // Native form select element that gumi links too
    this.$select = $('<select />');

    this.selectedIndex = 0;
    this.selectedLabel = undefined;
    this.selectedValue = undefined;

    this.options = $.extend({}, defaults, options);

    this._load = true;
    this._defaults = defaults;

    this._init();
  };

  /**
   * Build out our Gumi prototype and methods
   */
  Gumi.prototype = {
    constructor: Gumi,

    /**
     * Initialize the Gumi selectbox
     */
    _init: function() {
      this._createSelect();
      this._createDropdown();
      this._bindDropdown();
      this._bindSelectOption();
    },

    /**
     * Takes a serialized string of params and converts it to a map of data
     * based on the data attribute 'params' on the button node
     * e.g. { 'key' : 'val' }
     */
    _deserializeParams: function() {
      var params = this.$button.data('params'),
          data = {};

      if (!params) {
        return;
      }

      if (typeof params === 'string') {
        params = params.split(' ');

        var currentParam;
        for (var i = 0, len = params.length; i < len; i ++) {
          currentParam = params[i].split('=');
          data[currentParam[0]] = currentParam[1];
        }

        this._addDataToSelect(data);
      }
    },

    /**
     * Adds HTML5 Data attributes/values to the select
     * @param {object} data Map of data key to data value e.g. { 'height': 300 }
     */
    _addDataToSelect: function(data) {
      for (var key in data) {
        this.$select.data(key, data[key]);
      }
    },

    /**
     * Creates a hidden "<select>" based on
     * the list items from the ul jQuery selector
     */
    _createSelect: function() {
      var that = this,
          selectedIndex = 0;

      // Handle using a button that exists
      var $button = this.$elem.find('button');
      if ($button.length) {
        this.$button = $button;
      }

      // Copy some attributes over to our select
      this.$select
        .addClass(this.options.dropdownClass)
        .addClass(that.$button.data('class'))
        .attr('name', that.$button.data('name'))
        .prop('required', that.$button.data('required'))
        .hide();

      // Add 'data' params to the select as HTML data-attributes
      this._deserializeParams();

      // Add the list options to our select options
      this.$elem.find('li').each(function(index) {
        var $self = $(this);

        var value = $self.data('value') && $self.data('value').length === 0 ?
            $self.html() : $self.data('value'),
            label = $self.data('label') || $self.html() || value;

        // Figure out which one should be selected by default
        if ($self.data('selected') === true) {
          selectedIndex = index;
        }

        // Only show options that are selectable
        if ($self.data('selectable') === false) {
          $self.hide();
        }

        $('<option />')
          .val(value)
          .append(label)
          .addClass($self.attr('class'))
          .appendTo(that.$select);
      });

      // Set the default option
      this.setSelectedOption(selectedIndex);

      // Attach our native select to the DOM
      this.$elem.append(this.$select);
      this._load = false;
    },

    /**
     * Creates the clickable button to show
     * the dropdown, and attaches "optional"
     * custom classes to both the button and the dropdown
     */
    _createDropdown: function() {
      this.$button
        .addClass('gumi-btn')
        .addClass(this.options.buttonClass);

      // Insert the button before the dropdown
      this.$elem.prepend(this.$button);

      // Styling should hide the dropdown by default
      this.$dropdown
        .addClass('gumi-dropdown')
        .addClass(this.options.dropdownClass);
    },

    /**
     * Handle the interaction for showing and hiding the dropdown options
     */
    _bindDropdown: function() {
      var that = this;

      this.$button.on('click.Gumi', function(e) {
        e.preventDefault();
        e.stopPropagation();

        // We want to reset all other dropdowns on the page
        // to avoid having multiple dropdowns open at a time
        that.resetDropdowns(that.$elem);

        // Handles clicking the button toggling
        that.$button.toggleClass(that.options.buttonSelectedClass);
        that.$dropdown.toggle();

        if (that.$dropdown.is(':visible')) {
          that.options.onOpen.call(that.$elem);
        }
      });

      $(document).off('click.Gumi');
      $(document).on('click.Gumi', function(e) {
        if ($(e.target).closest('.gumi-dropdown').length === 0) {
          that.resetDropdowns();
        }
      });
    },

    /**
     * When a user selects an option, we need to update our native
     * <select> in addition to our instance data
     */
    _bindSelectOption: function() {
      var that = this;

      that.$dropdown.on('click.Gumi', 'li', function(e) {
        var $self = $(this);
        e.stopPropagation();

        if (!$self.data('disabled')) {
          that.setSelectedOption($(this).index());
          that._closeDropdown();
        }
      });
    },

    /**
     * Hides the dropdown and removes the selected state of the button
     */
    _closeDropdown: function() {
      this.$button.removeClass(this.options.buttonSelectedClass);
      this.$dropdown.hide();
    },

    /**
     * Resets all dropdowns on the page to default state, excluding callee
     * @param {jQueryObject} $elem Optional element to exclude from reset
     */
    resetDropdowns: function($elem) {
      $('.gumi-wrap').not($elem).each(function() {
        $(this).data('gumi')._closeDropdown();
      });
    },

    /**
     * Public interface to bind a custom change event handler
     * @param {string} evt The event type to listen to
     * @param {function} fn The function callback for the event
     */
    onEvent: function(evt, fn) {
      if (typeof fn === 'function') {
        if (this.options[evt]) {
          this.options[evt] = fn;
        }
      }
    },

    /**
     * Sets the selected state to the native select box
     * based on the index. Also updates the instance and the label on the button
     * @param {number} opt_index Index of the select option to select (defaults 0)
     */
    setSelectedOption: function(opt_index) {
      opt_index = opt_index || 0;

      var $option = this.$select.find('option').eq(opt_index);

      this.selectedIndex = opt_index;
      this.selectedLabel = this.$dropdown.eq(opt_index).data('label') || $option.text();
      this.selectedValue = $option.val();

      $option
        .prop('selected', true)
        .trigger('change');

      if (this._load === false ||
          (this._load === true && !this.$button.data('default-value'))) {
        this.$button.html('<span><em>' + this.selectedLabel + '</em><i class="icn arrow-down">&nbsp;</i></span>');

        // Trigger our custom callback
        this.options.onChange.call(this.$select);
      }
    }
  };

  /**
   * Simple jQuery API for Gumi
   */
  $.fn.gumi = function(options) {
    return this.each(function() {
      if (!$.data(this, 'gumi')) {
        $.data(this, 'gumi', new Gumi(this, options));
      }
    });
  };

})(jQuery, window, document);

