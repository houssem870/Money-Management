function initStatisticPage() {

	changeCurrency = function () {
		switch (user.checkedCurr) {
			case "RUB":
				if (user.lastCurr == "RUB") { break; }
				else if (user.lastCurr == "USD") { savings.freeMoney = (savings.freeMoney * global.usd).toFixed(3); }
				else if (user.lastCurr == "EUR") { savings.freeMoney = (savings.freeMoney * global.eur).toFixed(3); }
				break;
			case "EUR":
				if (user.lastCurr == "EUR") { break; }
				else if (user.lastCurr == "USD") { savings.freeMoney = (savings.freeMoney * global.usd / global.eur).toFixed(3); }
				else if (user.lastCurr == "RUB") { savings.freeMoney = (savings.freeMoney / global.eur).toFixed(3); }
				break;
			case "USD":
				if (user.lastCurr == "USD") { break; }
				else if (user.lastCurr == "EUR") { savings.freeMoney = (savings.freeMoney * global.eur / global.usd).toFixed(3); }
				else if (user.lastCurr == "RUB") { savings.freeMoney = (savings.freeMoney / global.usd).toFixed(3); }
				break;
		}
		user.lastCurr = user.checkedCurr;
	};

	changeCurrency();

	initCircle = function (whichcircle, item, beforevalue) {
		var sum, value, circle;
		$("#" + whichcircle + "circlediv").show();
		if ( item.hasOwnProperty("income_id") ) {
			sum = incomesSumMonth;
			value = item.income_id;
		}
		else {
			sum = expensesSumMonth;
			value = parseInt(item.expense_id, 10) + 100;
		}
		switch (whichcircle) {
			case "first": animatecircle.call($("#first-circle"), beforevalue, (item.converted / 730).toFixed(2), (sum / 730), item.title );
				circle = 1;
				$("#first-circle").data({"item": item, "sum": sum});
				break;
			case "second": animatecircle.call($("#second-circle"), beforevalue, (item.converted / 30.41666667).toFixed(1), (sum / 30.41666667), item.title );
				circle = 2;
				$("#second-circle").data({"item": item, "sum": sum});
				break;
			case "third": animatecircle.call($("#third-circle"), beforevalue, Math.round(item.converted * 1.2) * 10, (sum * 1.2) * 10, item.title );
				circle = 3;
				$("#third-circle").data({"item": item, "sum": sum});
				break;
		}
		$("#circle-select-" + circle).find('option').removeAttr("selected");
		setTimeout( function() { $("#circle-select-" + circle +" option[value=" + value + "]").attr('selected','selected'); $('select').trigger('refresh'); } , 100)
		$("#circle-select-" + circle + "-back").removeClass().addClass(item.icon);
	}

	if (incomes[ $("#incomeslider").data("firstitem") ] != undefined && expenses[ $("#expenseslider").data("firstitem") ] != undefined) {
		initCircle("first", incomes[ $("#incomeslider").data("firstitem") ], 0);
		initCircle("second", expenses[ $("#expenseslider").data("firstitem") ], 0);
		if ( $("#expenseslider").data("seconditem") !== undefined ) { initCircle("third", expenses[ $("#expenseslider").data("seconditem") ], 0); }
		else initCircle("third", expenses[ $("#expenseslider").data("firstitem") ], 0);
	}

	$("#expenses-lines-container").html('<div class="lines-title"> Expenses structure <span class="grey">(' + separateNumber(expensesSumMonth) + '<span class="greysmall"><span class="greysmallval curr"></span>/Month</span>)<span></span></div>')
	$("#incomes-lines-container").html('<div class="lines-title"> Incomes structure <span class="grey">(' + separateNumber(incomesSumMonth) + '<span class="greysmall"><span class="greysmallval curr"></span>/Month</span>)<span></span></div>')

	var incomesIdSorted = Object.keys(incomes).sort(function(a,b){return incomes[b].converted - incomes[a].converted});
	var expensesIdSorted = Object.keys(expenses).sort(function(a,b){return expenses[b].converted - expenses[a].converted});

	initlines = function(column) {
		var container, idSorted, maxConvertedId, i;
		if (column == incomes) {container = "#incomes-lines-container"; idSorted = incomesIdSorted; maxConvertedId = incomesIdSorted[0]; sum = incomesSumMonth; i=0}
		else {container = "#expenses-lines-container"; idSorted = expensesIdSorted; maxConvertedId = expensesIdSorted[0]; sum = expensesSumMonth; i=100}

		idSorted.forEach(function(id) {
			$(container).append('<div id="line-' + i + '" class="itemline"><span class="lineitemtitle lightcircletitle">' + column[id].title + '</span><div class="lineitempercent">'+ Math.round(100 * column[id].converted / sum) +'%</div><div class="lineitemvalue">' + separateNumber(Math.round(column[id].converted)) + ' <span class="boldcircletitle curr lineitemcurr"></span><span class="lightcircletitle lineitemcurr">/Month</span></div><div class="leftpoint"></div><div id="linebackground-'+ i +'" class="itemlinebackground"></div></div>');
			$("#line-" + i).data({"item": column[id]}).css({"width": Math.round(100 * column[ id ].converted / column[maxConvertedId].converted ) + "%"});
			$("#linebackground-" + i).addClass(column[id].icon);
			i++;
		});
		$("#line-0, #line-100").addClass("activeline");
	}

	initlines(incomes);
	initlines(expenses);

	// FUTURE SAVINGS CALCULATION
	initSavingsCircles = function (slidervalue, lastslidervalue, beforevalue, beforemiddlevalue, animatetime) {

		var monthSavings = [],
				depositMonthSavings = [],
				delta = incomesSumMonth - expensesSumMonth,
				deltaDeposit = delta * slidervalue,
				deltaNoDeposit =  delta * (1 - slidervalue),
				percent = savings.percent,
				deltapercents = 0;
		monthSavings[0] = parseInt(savings.freeMoney, 10);

		// Set deposit tips next to slider
		if (slidervalue === 0) {
			$("#savingsTip100").hide();
			$("#savingsTip0").fadeIn(200);
		}
		else if (slidervalue === 1) {
			$("#savingsTip0").hide();
			$("#savingsTip100").fadeIn(200);
		}
		else {
			$("#savingsTip0, #savingsTip100").fadeOut(200);
		}

		if (delta >= 0) {	// if incomes > expenses
			if (savings.deposit) {	// deposit turned on
				if (savings.capitalization) { // capitalization turned on (percent adds every month)
					if (delta === 0) { // delta = 0
						$('#savings-slider').css({"opacity": "0.5"}).attr('disabled', 'disabled');
						$("#savingsTip100, #savingsTip0").hide();
						for (var k=1; k < 13; k++) {
							monthSavings[k] = ( parseInt(monthSavings[ (k-1) ], 10) + delta );
						}
						if (monthSavings[0] === 0) { // Savings = 0
							// Draw horizontal chart
							$({ value: 91 }).animate({ value: 155 }, {
								duration: animatetime,
								easing: 'swing',
								step: function () {
									drawChartLine(this.value);
								}
							});
						}
						else { // Savings > 0
							// Draw increasing chart
							$({ value: 91 }).animate({ value: 70 }, {
								duration: animatetime,
								easing: 'swing',
								step: function () {
									drawChartLine(this.value);
								}
							});
						}
					}
					else { // delta > 0
						$('#savings-slider').css({"opacity": "1"}).removeAttr('disabled');
						// Animate chart
						$({ value: lastslidervalue}).animate({ value: slidervalue }, {
							duration: animatetime,
							easing: 'swing',
							step: function () {
								drawChartLine(110 - (this.value) * 95);
							}
						});
					}
					depositMonthSavings[0] = monthSavings[0];
					for (var i=1; i < 13; i++) {
						depositMonthSavings[i] = ( deltaDeposit + parseInt(depositMonthSavings[ (i-1) ], 10) + ( parseInt(depositMonthSavings[ (i-1) ], 10) * percent * 30.41666667 / 36500 ) ) // including delta in the last MONTH!
						monthSavings[i] = (depositMonthSavings[i] + (deltaNoDeposit * i));
					}
				}
				else {	 // capitalization turned off (percent adds in the last MONTH)
					if (delta === 0) {
						$('#savings-slider').css({"opacity": "0.5"}).attr('disabled', 'disabled');
						$("#savingsTip100, #savingsTip0").hide();
						if (monthSavings[0] === 0) {
							// Draw horizontal chart
							$({ value: 91 }).animate({ value: 155 }, {
								duration: animatetime,
								easing: 'swing',
								step: function () {
									drawChartLine(this.value);
								}
							});
						}
						else {
							// Draw increasing chart
							$({ value: 91 }).animate({ value: 80 }, {
								duration: animatetime,
								easing: 'swing',
								step: function () {
									drawChartLine(this.value);
								}
							});
						}
					}
					else {
						$('#savings-slider').css({"opacity": "1"}).removeAttr('disabled');
						// Animate chart
						$({ value: lastslidervalue}).animate({ value: slidervalue }, {
							duration: animatetime,
							easing: 'swing',
							step: function () {
								drawChartLine(110 - (this.value) * 95);
							}
						});
					}
					for (var j=1; j < 12; j++) {
						monthSavings[j] = ( parseInt(monthSavings[ (j-1) ], 10) + deltaDeposit );
						deltapercents = deltapercents + ( deltaDeposit * percent * j / 1200 );
					}
					monthSavings[12] = (monthSavings[0] * (1 + (savings.percent / 100)) ) + (deltaDeposit * 12) + (deltaNoDeposit * 12) + deltapercents; // including delta in the last month!
				}
			}
			else {		// deposit turned off
				$('#savings-slider').css({"opacity": "0.5"}).attr('disabled', 'disabled');
				$("#savingsTip100, #savingsTip0").hide();
				$('.noUi-handle:after').css({"opacity": "0"})
				for (var k=1; k < 13; k++) {
					monthSavings[k] = ( parseInt(monthSavings[ (k-1) ], 10) + delta );
				}
				if (delta === 0) {
					// Draw horizontal chart
					$({ value: 91 }).animate({ value: 155 }, {
						duration: animatetime,
						easing: 'swing',
						step: function () {
							drawChartLine(this.value);
						}
					});
				}
				else {
					// Draw increasing chart
					$({ value: 91 }).animate({ value: 120 }, {
						duration: animatetime,
						easing: 'swing',
						step: function () {
							drawChartLine(this.value);
						}
					});
				}
			}
		}
		else {	// if incomes < expenses
			$('#savings-slider').css({"opacity": "0.5"}).attr('disabled', 'disabled');
			$("#savingsTip100, #savingsTip0").hide();
			$('.noUi-handle:after').css({"opacity": "0"});
			for (var n=1; n < 13; n++) {
				monthSavings[n] = ( parseInt(monthSavings[ (n-1) ], 10) + delta );
			}
			// Draw decreasing chart
			$({ value: 91 }).animate({ value: 175 }, {
				duration: animatetime,
				easing: 'swing',
				step: function () {
					drawChartLine(this.value);
				}
			});
		}

		var aftervalue = monthSavings[12];

		$("#before-savings-value").html( separateNumber( Math.round(savings.freeMoney) ) );
		$("#after-savings-value").data({"lastvalue": aftervalue, "lastmiddlevalue": monthSavings[6]}).html( separateNumber(Math.round((savings.freeMoney * 10.222) / 100) * 100) );
		$("#savings-slider").data("lastpercent", $("#savings-slider").data("checkedPercent"));

		// Set font-size in big circle
		(function() {
			if (Math.abs (aftervalue) < 9999999 ) {
				$("#after-savings-value").css({"font-size": "48px"})
			}
			else if (Math.abs (aftervalue) < 99999999) {
				$("#after-savings-value").css({"font-size": "42px"})
			}
			else {
				$("#after-savings-value").css({"font-size": "37px"})
			}
			if (Math.abs (beforevalue) > 9999999 ) {
				$("#before-savings-value").css({"font-size": "26px"})
			}
		})();

		// Animate last value on chart
		$({ value: beforevalue }).animate({ value: aftervalue }, {
			duration: animatetime,
			easing: 'linear',
			step: function () {
				$("#after-savings-value").html(separateNumber( Math.round(this.value / 10) * 10));
				$("#month12").children(".large-month-val").children(".val").html(separateNumber(Math.round(this.value / 10) * 10));
			}
		});
		// Animate middle value on chart
		$({ value: beforemiddlevalue }).animate({ value: monthSavings[6] }, {
			duration: animatetime,
			easing: 'linear',
			step: function () {
				$("#month6").children(".large-month-val").children(".val").html(separateNumber( Math.round(this.value)));
			}
		});
		// Set precision value
		setTimeout(function() {
			$("#after-savings-value").html(separateNumber( Math.round(aftervalue / 10) * 10));
			$("#month12").children(".large-month-val").children(".val").html(separateNumber(Math.round(aftervalue / 10) * 10));
		}, animatetime+20);

		// Set every month values on chart
		for (i = 1; i < 12; i++) {
			$("#month" + i).children(".month-val").children(".val").html(separateNumber(Math.round(monthSavings[i])));
		}
		$("#month6, #month12").children(".month-val").html("");
	}

	// Launch Savings circles
	if (typeof $("#savings-slider").data('checkedPercent') == 'undefined')
	{
		$("#savings-slider").data({"checkedPercent": Number(user.checkedPercent) });
	}

	// Change currency stuff
	$("#rubcurr, #eurcurr, #usdcurr").removeClass("currchecked");
	switch (user.checkedCurr) {
		case "RUB": $(".curr").html(" Rub ").data("curr", " rub."); $(".savings-circle-currency").html(" Rubles "); $("#rubcurr").addClass("currchecked");
			break;
		case "EUR": $(".curr, .savings-circle-currency").html(" Eur ").data("curr", " \u20ac"); $("#eurcurr").addClass("currchecked");
			break;
		case "USD": $(".curr, .savings-circle-currency").html(" USD ").data("curr", " $"); $("#usdcurr").addClass("currchecked");
			break;
	}

	if (incomesSumMonth > expensesSumMonth) {
		setTimeout(function() {
			$(".topmaincircletitle").html("Spare");
			simpleanimatecircle.call($("#inner-circle"), 0, 100, 1200);
			$("#outer-circle-value").css({"color": "black"});
			$("#incomes-cursor").hide();
			$("#expense-cursor").show();
			animatecircle.call($("#outer-circle"), 0, Math.round(expensesSumMonth), Math.round(incomesSumMonth));}, 350);
	}
	else {
		setTimeout(function() {
			$(".topmaincircletitle").html("Loss");
			simpleanimatecircle.call($("#inner-circle"), 0, 100, 800);
			$("#outer-circle-value").css({"color": "#eaa7a7"});
			$("#expense-cursor").hide();
			$("#incomes-cursor").show();
			animatecircle.call($("#outer-circle"), 0, Math.round(incomesSumMonth), Math.round(expensesSumMonth)); }, 350);
	}
}

/**
 * EVENT HANDLERS
 */

// Currency buttons
$(".currunchecked").click(function() {
	if (this.id == "eurcurr") {
		user.checkedCurr = "EUR";
	}
	else if (this.id == "usdcurr") {
		user.checkedCurr = "USD";
	}
	else {
		user.checkedCurr = "RUB";
	}
	runConvert();

	initStatisticPage();
	setTimeout(function() { initSavingsCircles($("#savings-slider").data("checkedPercent"), 0.2, savings.freeMoney, savings.freeMoney, 700) }, 100);
	initCircle("first", $("#first-circle").data("item"), 0);
	initCircle("second", $("#second-circle").data("item"), 0);
	initCircle("third", $("#third-circle").data("item"), 0);

	$('#savings-slider').noUiSlider({
		start: (incomesSumMonth-expensesSumMonth) * $("#savings-slider").data("checkedPercent"),
		step: (incomesSumMonth-expensesSumMonth) / 20,
		range: {
			'min': [ 0 ],
			'max': [ Math.abs(incomesSumMonth-expensesSumMonth) ]
		}
	}, true);
});

$("#outermaindiv, #incomes-cursor, #expense-cursor, .lines-title").click(function() {
	setTimeout(function() { $("#expenses-lines-container, #incomes-lines-container").toggle(); }, 250);
	$("#expense-cursor, #incomes-cursor").toggle(300);
	$(".itemline").removeClass("activeline");
	$("#line-0, #line-100").addClass("activeline");
});

$("#expenses-lines-container, #incomes-lines-container").on("hover", ".itemline", function() {
	$(".itemline").removeClass("activeline");
	$(this).addClass("activeline");
});

$("#expenses-lines-container, #incomes-lines-container").on("click", ".itemline", function() {
	$(".itemline").removeClass("activeline");
	$(this).addClass("activeline");
	var item = $(this).data("item");
	initCircle("first", item, 0);
	initCircle("second", item, 0);
	initCircle("third", item, 0);
});

$("#firstcirclediv, #secondcirclediv, #thirdcirclediv").click(function() {
	$("#" + this.id + "flipper").toggleClass("flippedcard");
});

$("#circle-select-1, #circle-select-2, #circle-select-3").on("change", function() {
	var column, item,
			circle = this.id,
			whichCircle;
	switch (circle) {
		case "circle-select-1": whichCircle = "first";
			break;
		case "circle-select-2": whichCircle = "second";
			break;
		default: whichCircle = "third";
			break;
	}
	if ($(this).val() < 100 ) {
		column = incomes;
		item = $(this).val();
		setTimeout(function() { initCircle( whichCircle, column[item], 0) }, 300);
	}
	else {
		column = expenses;
		item = $(this).val() - 100;
		setTimeout(function() { initCircle( whichCircle, column[item], 0) }, 300);
	}
	$("#" + circle + "-back").removeClass().addClass( column[item].icon );
});

function initSavingsSlider() {
	var Link = $.noUiSlider.Link,
			sub;
	simpleSeparateNumber = function(val) {
		if (Math.abs (val) > 999) {
			val = val.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1 ');
		}
		else {
			val = val.toString().replace(/(\.)/g, '$1');
		}
		return val;
	};
	$('#savings-slider').noUiSlider({
		start: (incomesSumMonth-expensesSumMonth) * user.checkedPercent,
		step: (incomesSumMonth-expensesSumMonth) / 20,
		range: {
			'min': [ 0 ],
			'max': [ incomesSumMonth-expensesSumMonth ]
		},
		serialization: {
			lower: [
				new Link({	target: function(value){ $("#savings-slider").data({"checkedPercent": Math.round(value / (incomesSumMonth-expensesSumMonth + 0.001) * 100) / 100}); $(".noUi-handle").attr({ percent: Math.round(value / (incomesSumMonth-expensesSumMonth + 0.001) * 100) + "%"  }) }, format: { decimals: 0 } }),
				new Link({	target: function(value){ $(".noUi-handle").attr({ value: simpleSeparateNumber(Math.round(value / 10 ) * 10) + $(".curr").data("curr")}) }, format: { decimals: 0} })
			]
		}
	});
}

$('#savings-slider').on('slide', function() {
	var lastVal = $("#after-savings-value").data("lastvalue"),
			animatetime;
	if (lastVal < 99999) animatetime = 200;
	else animatetime = 700;
	initSavingsCircles($("#savings-slider").data("checkedPercent"), $("#savings-slider").data("lastpercent"), lastVal, $("#after-savings-value").data("lastmiddlevalue"), animatetime);
});