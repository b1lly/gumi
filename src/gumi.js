/**
 * Gumi v1.1.0
 * Usage: http://b1lly.github.io/gumi
 * GitHub: http://github.com/b1lly/gumi
 */

;(function($, window, document, undefined) {
  var defaults = {
    buttonClass: 'gumi-btn-default',
    buttonSelectedClass: 'gumi-btn-selected',
    buttonDisabledClass: 'gumi-btn-disabled',
    optionDisabledClass: 'gumi-option-disabled',
    dropdownClass: 'gumi-dropdown-default',
    onChange: function() {},
    onOpen: function() {},
    onCancel: function() {
      this.reset();
    }
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
    this.$button = $('<button />');

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
    this._initialSelected = undefined;

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
      this._createButton();
      this._createSelect();
      this._createDropdown();
      this._bindDropdown();
      this._bindSelectOption();
    },

    /**
     * Handle creating our button based on a variety of cases
     */
    _createButton: function() {
      var that = this;

      // Handle using a button that exists (or use our default)
      // and create the structure of our button label layout
      var $button = this.$elem.find('button'),
          $label = $('<span><em><em></span>');

      if ($button.length) {
        this.$button = $button;
      }

      // Show the arrow icon on the label by default, unless otherwise specified
      if (!this.$button.attr('data-arrow-icn') ||
          this.$button.data('arrow-icn') === true) {
        $label.append('<i class="icn arrow-down">&nbsp;</i>');
      }

      // Only show the close icon if specified
      // The binding get's handled in the '_bindDropdown()' method
      if (this.$button.data('cancel-icn') &&
          this.selectedIndex != this._initialSelected) {
        $label.append('<i class="icn cancel-icn js-gumi-cancel">&nbsp;</i>');
      }

      // Only update the button label on create if the option isn't
      // being forced to remain the same (to avoid FOUC)
      if (!this.$button.data('default-value')) {
        this.$button.html($('<div>').append($label).html());
      }

      // Updates the state of the button
      this._updateButton();
    },

    /**
     * Convienience method to update the button styling based on
     * potential attributes changing
     */
    _updateButton: function() {
      // Apply custom disabled styling to the button if necessary
      this.$button.toggleClass(this.options.buttonDisabledClass, this.$button.data('disabled') === true);
    },

    /**
     * Creates a hidden "<select>" based on
     * the list items from the ul jQuery selector
     */
    _createSelect: function() {
      // Adds the properties and options to our select
      // and get the selectedIndex from the option parsing
      this._updateSelect();

      // Attach our native select to the DOM
      this.$elem.append(this.$select);

      this._load = false;
    },

    /**
     * Updates the "<select>" properties, options and values
     * based on the current list of options from the "<ul>"
     */
    _updateSelect: function() {
      var that = this,
          selectedIndex = 0;

      // Copy some attributes over to our select
      this.$select
        .addClass(this.options.dropdownClass)
        .addClass(this.$button.data('class'))
        .attr('name', this.$button.data('name'))
        .prop('required', this.$button.data('required'))
        .hide();

      // Add 'data' params to the select as HTML data-attributes
      this._deserializeParams();

      // Add the list options to our select options
      this.$elem.find('li').each(function(index) {
        var $self = $(this),
            val = $self.data('value');

        var value = val === undefined && val !== '' ? $self.html() : String(val),
            label = $self.data('label') || $self.html() || value;

        // Figure out which one should be selected by default
        if ($self.data('selected') === true) {
          selectedIndex = index;
        }

        // Handle custom styling for disabled class
        $self.toggleClass(that.options.optionDisabledClass, $self.data('disabled') === true);

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

      // Set the initial selected
      this._initialSelected = selectedIndex;

      // Set the default option
      this.setSelectedOption(selectedIndex, true);

      return selectedIndex;
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
        that._resetDropdowns(that.$elem);

        // A disabled button should do nothing
        if ($(this).data('disabled')) {
          return;
        }

        // Handle the user clicking the 'cancel' icon
        if ($(e.target).hasClass('js-gumi-cancel')) {
          that.options.onCancel.call(that);
          return;
        }

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
          that._resetDropdowns();
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
          that.closeDropdown();
        }
      });
    },

    /**
     * Resets all dropdowns on the page to default state, excluding callee
     * @param {jQueryObject} $elem Optional element to exclude from reset
     */
    _resetDropdowns: function($elem) {
      $('.gumi-wrap').not($elem).each(function() {
        $(this).data('gumi').closeDropdown();
      });
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
     * Sync the markup with the hidden select
     */
    update: function() {
      this.$elem.find('select').empty();
      this._updateSelect();
      this._updateButton();
    },

    /**
     * Set the selected option based on it's value
     * @param {string|number|boolean} value The value of the option to look for in our list
     * @param {boolean} opt_noEvent True will not fire an event on the select
     */
    setSelected: function(value, opt_noEvent) {
      var $option = this.$select.find('option[value="' + value + '"]');

      if ($option.length) {
        this.setSelectedOption($option.index(), opt_noEvent);
      }
    },

    /**
     * Sets the selected state to the native select box
     * based on the index. Also updates the instance and the label on the button
     * @param {number} opt_index Index of the select option to select (defaults 0)
     * @param {boolean} opt_noEvent True will not fire an event on the select
     */
    setSelectedOption: function(opt_index, opt_noEvent) {
      opt_index = opt_index || 0;

      var label;
      var $option = this.$select.find('option').eq(opt_index);

      this.selectedIndex = opt_index;
      this.selectedLabel = this.$dropdown.eq(opt_index).data('label') || $option.text();
      this.selectedValue = $option.val();

      $option.prop('selected', true);

      if (!opt_noEvent) {
        $option.trigger('change');
        this.options.onChange.call(this.$select);
      }

      // Only deal with no change when it's NOT on the initial loading event.
      // Also, during load, if it has a default value set, don't update the text.
      if ((this._load === false && this.$button.data('no-change') !== true) ||
          (this._load === true && !this.$button.data('default-value'))) {
        this.$button.find('span em').text(this.selectedLabel);
      }
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
     * Hides the dropdown and removes the selected state of the button
     */
    closeDropdown: function() {
      this.$button.removeClass(this.options.buttonSelectedClass);
      this.$dropdown.hide();
    },

    /**
     * Resets the dropdown to it's original state during initialization
     */
    reset: function() {
      this.setSelectedOption(this._initialSelected);
    },

    /**
     * Returns selected value
     */
    val: function() {
      return this.selectedValue;
    }
  };

  /**
   * Simple jQuery API for Gumi
   */
  $.fn.gumi = function(options) {
    var args = arguments,
        that = this;

    return this.each(function(index) {
      // Tries to get the instance of gumi that is referenced by the node
      var gumi = $.data(this, 'gumi');

      // If there's no gumi instance, assume we're initializing
      if (!gumi) {
        $.data(this, 'gumi', new Gumi(this, options));

        // Broadcast a "we're finished loading" event
        if (index === that.length - 1) {
          $(this).trigger('ready.Gumi');
        }
      } else {
        // Otherwise, access our public API (if viable)
        if (typeof options === 'string' &&
            typeof gumi[options] === 'function') {
          gumi[options].apply(gumi, Array.prototype.slice.call(args, 1));
        }
      }
    });
  };
})(jQuery, window, document);
