$(function() {

    /* Typed-in animation setup */
    if($('.typed-in').length) {
        var typed = new Typed('.typed-in', {
            stringsElement: '.typed-phrases',
            typeSpeed: 40,
            backDelay: 1400,
            backSpeed: 30,
            loop: true
        });
    }

    /* Bootstrap popover setup */
    $('[data-toggle="popover"]').popover({
        content: function(){
            if ($(this).data('content')){
                return $(this).data('content');
            } else if ($(this).find('.popover-body').length) {
                return $(this).find('.popover-body');
            }
        }
    });

    /* Re-arrange HTML generated by DataTable */
    var DataTable = $.fn.dataTable;
    $.extend( true, DataTable.defaults, {
        dom:
            "<'row datatables-top'<'col-sm-12 col-md-6 col-show'l><'col-sm-12 col-md-6 col-search'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row datatables-bottom'<'col-sm-12 col-md-5 col-paginate'p><'col-sm-12 col-md-7 col-info'i>>",
        renderer: 'bootstrap'
    } );

    $('.dynamic-table').DataTable( {
        initComplete: function () {
            let nbFilters = 0;
            this.api().columns().every( function () {
                var column = this;
                window['col'] = column;

                // Remove sorting if not set
                if (column.header().dataset.sort !== 'yes') {
                    $(column.header()).unbind('click');
                    $(column.header()).unbind('click');
                }

                // Setup filtering on column
                if (column.header().dataset.filter === 'yes') {
                    window['col'] = column;
                    var select = $('<select><option value="">All</option></select>')
                    //.appendTo( $(column.footer()).empty() )
                    .appendTo( $(column.header().dataset.filterCell) )
                    .on( 'change', function () {
                        var val = $.fn.dataTable.util.escapeRegex(
                            $(this).val()
                        );

                        column
                            .search( val ? '^'+val+'$' : '', true, false )
                            .draw();
                    } );

                    column.data().unique().sort().each( function ( d, j ) {
                        select.append( '<option value="'+d+'">'+d+'</option>' )
                    } );
                    nbFilters++;
                }
            } );

            if (nbFilters > 0) {
                $('.table-filtering').show();
            }
        }
    } );

    $(document).on('lity:open', function(event, instance) {
        // Add caption div to the lightbox
        if ($(instance.opener()).data('caption')){
            const $captionDiv = $('<div></div>').addClass('lity-caption').html($(instance.opener()).data('caption'));
            $(instance.element()).find('.lity-container').append($captionDiv);
        }
    });

    if ($('.vesc-log-chart-container .chart-container').length && window.labels && window.datasets) {

      // Setup horizontal scrolling
      const chartCanva = $('<canvas id="vescLogChart"></canvas>');
      const $chartContainer = $('.vesc-log-chart-container .chart-container');
      const $filtersContainer = $('.chart-filters-container');

      $chartContainer.on('mousewheel DOMMouseScroll', function(event) {
        var delta = Math.max(-1, Math.min(1, (event.originalEvent.wheelDelta || -event.originalEvent.detail)));
        $(this).scrollLeft( $(this).scrollLeft() - ( delta * 50 ) );
        event.preventDefault();
      });

      window.currentChartPart = 0;

      chartCanva.css('width', window.labels[window.currentChartPart].length * 8+'px');
      chartCanva.css('height', 300+'px');
      $('.vesc-log-chart-container .chart-container').append(chartCanva);
      const ctx = document.getElementById("vescLogChart").getContext('2d');
      let chartDataset = [];

      const vescChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: window.labels[window.currentChartPart],
          datasets: chartDataset
        },
        options: {
          responsive: false,
          tooltips: {
            mode: 'index',
            intersect: false,
          },
          hover: {
            mode: 'nearest',
            intersect: true
          },
          scales: {
            xAxes: [{
              type: 'time',
            }],
            yAxes: [{
              ticks: {
                beginAtZero:true
              }
            }]
          }
        }
      });

      if (window.labels.length > 1) {
        // Chart in multiple parts
        const $charPartsButtonsContainer = $('<div class="chart-parts-actions-container"></div>');
        const $chartPartsButtons = $('<div class="chart-parts-actions-buttons"></div>')
        for (let i = 0; i < window.labels.length; i++) {
          const $buttonPart = $('<button class="btn btn-secondary '+(i==0?'active':'')+'" data-part-id="'+i+'">Part '+(i+1)+'</button>');
          $chartPartsButtons.append($buttonPart);
        }
        $charPartsButtonsContainer.append($chartPartsButtons);

        $filtersContainer.append($charPartsButtonsContainer);

        $chartPartsButtons.find('button').on('click', function(e){
          e.preventDefault();

          const partId = parseInt($(this).data('part-id'), 10);
          if (!$(this).hasClass('active')) {
            window.currentChartPart = partId;

            vescChart.data.labels = window.labels[window.currentChartPart];
            filterChartUpdate();

            $(this).parent().find('button').removeClass('active');
            $(this).addClass('active');
          }
        });
      }

      // Setup filters
      for (let i = 0; i < window.datasets[window.currentChartPart].length; i++) {
        let checkedState = '';
        if (window.datasets[window.currentChartPart][i].label === 'InpVoltage'
          || window.datasets[window.currentChartPart][i].label === 'MotorCurrent'
          || window.datasets[window.currentChartPart][i].label === 'Speed') {
            checkedState = 'checked="checked"';
        }
        $filterRow = $('<div class="filter-row"></div>');
        $filterRow.append('<label for="dataset-id-'+i+'" class="filter-label">'+window.datasets[window.currentChartPart][i].label+'</label>');
        $filterRow.append('<span class="filter-trigger"><input id="dataset-id-'+i+'" type="checkbox" name="datasetName" value="'+window.datasets[window.currentChartPart][i].label+'" '+checkedState+' /></span>');
        $filtersContainer.append($filterRow);
      }

      filterChartUpdate();

      // UI update once everything is setup and ready
      $('.chart-loading-container').hide();
      $('.chart-container, .chart-filters-container').fadeIn();

      // Filter events init
      $('.chart-filters-container input').on('change', function(event){
        filterChartUpdate();
      });

      /**
       * Update the whole chart using filters
       * @return void
       */
      function filterChartUpdate() {
        let newDataset = [];
        for (let i = 0; i < window.datasets[window.currentChartPart].length; i++) {
          if ($('.chart-filters-container input[value="'+window.datasets[window.currentChartPart][i].label+'"]').is(':checked')) {
            newDataset.push(window.datasets[window.currentChartPart][i]);
          }
        }
        vescChart.data.datasets = newDataset;
        vescChart.update();
      }
    }
});
