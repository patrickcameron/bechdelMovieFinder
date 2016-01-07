var movieDBKey = "68648bc22dd03754bbe2b368551f7eb2";

var movieApp = {};

var movieInfo = {};

movieApp.getMovies = function() {
	var releaseYear = $('#year').val();
	var genreCode = $('#genre').val();
	$.ajax({
		url: 'http://api.themoviedb.org/3/discover/movie?api_key=' + movieDBKey + '&primary_release_year=' + releaseYear + '&with_genres=' + genreCode,
		method: 'GET',
		dataType: 'jsonp'
	}).then(function(data) {
		movieInfo = data;
		console.log(movieInfo);
		movieApp.shortenDescriptions();
		movieApp.getIMDBNumber();
	});
};

movieApp.shortenDescriptions = function() {
	for (var i in movieInfo.results) {
		var descriptionLength = movieInfo.results[i].overview.length;
		if (descriptionLength > 300) {
			movieInfo.results[i].overview = movieInfo.results[i].overview.slice(0,300);
			movieInfo.results[i].overview = movieInfo.results[i].overview.concat("...");
		}
	}
};

movieApp.getIMDBNumber = function() {

	//Map results array and return new promise from $.ajax
	//So the results stored in imdbNums is an array of promises
	var imdbNums = movieInfo.results.map(function(num) {
		return $.ajax({
			url: 'http://api.themoviedb.org/3/movie/' + num.id + '?api_key=' + movieDBKey,
			method: 'GET',
			dataType: 'jsonp'
		});
	});

	//The when method is used to listen for when one or more promises resolve.
	// $.when(promize1,promize2).then(function(data1,data2) {

	// });
	$.when.apply(null,imdbNums).then(function() {

		//arguments is an ARRAY LIKE value, it does not have the array methods on it.

		//Array.prototype.map is the original .map method
		//And we can use .call() to say HEY treat my arguments as and array
		//so I can use this method. 
		var movies = Array.prototype.map.call(arguments,function(movie) {
			console.log(movie);
			var imdbNum = movie[0].imdb_id;
			imdbNum = imdbNum.substr(2);
			imdbNum = imdbNum.toString();
			//Return new promise with bechdel api call
			return $.ajax({
					url: 'http://proxy.hackeryou.com',
					method: 'GET',
					dataType: 'json',
					data: {
						reqUrl: 'http://bechdeltest.com/api/v1/getMovieByImdbId',
						imdbid: imdbNum
					}
				});
		});


		// We have to do the same as the above to make our movies promise array
		//work with $.when
		$.when.apply(null, movies).then(function() {

			Array.prototype.forEach.call(arguments, function(movie,index) {
				movieInfo.results[index].bechdelRating = movie[0].rating;
				console.log(movieInfo.results[index].bechdelRating);
			});

			movieApp.displayResults();
		});

	});
	// for (var i in movieInfo.results) {


	// 	(function(index) {
	// 		$.ajax({
	// 			url: 'http://api.themoviedb.org/3/movie/' + movieInfo.results[index].id + '?api_key=' + movieDBKey,
	// 			method: 'GET',
	// 			dataType: 'jsonp'
	// 		}).then(function(data) {
	// 			var imdbNum = data.imdb_id;
	// 			imdbNum = imdbNum.substr(2);
	// 			imdbNum = imdbNum.toString();
	// 			console.log(imdbNum);
	// 			$.ajax({
	// 				url: 'http://proxy.hackeryou.com',
	// 				method: 'GET',
	// 				dataType: 'json',
	// 				data: {
	// 					reqUrl: 'http://bechdeltest.com/api/v1/getMovieByImdbId',
	// 					imdbid: imdbNum
	// 				}
	// 				}).then(function(data) {
	// 					movieInfo.results[index].bechdelRating = data.rating;
	// 					console.log(movieInfo.results[index].bechdelRating);
	// 			});
	// 		});
	// 	})(i)
	// }
	// movieApp.displayResults();
};

movieApp.results = function() {
	$('form').on('submit', function(e) {
		e.preventDefault();
		movieApp.getMovies();
		$('.submitButton').attr("value", "Searching. Just a second...");
	});	
};

movieApp.displayResults = function() {
	$('.results').html('');
	for (var i in movieInfo.results) {
		$('.results').append('<div class="movie">' + '<a target="_blank" href="https://www.themoviedb.org/movie/' + movieInfo.results[i].id +'">' + '<img class="movie-poster" src="http://image.tmdb.org/t/p/w500' + movieInfo.results[i].poster_path +'">' + '</a>' + '<a class="titleLink" href="https://www.themoviedb.org/movie/' + movieInfo.results[i].id + '"> <h3>' + movieInfo.results[i].title + '</h3> </a>' + '<p class="description">' + movieInfo.results[i].overview + '</p>' + '<p>' + movieInfo.results[i].bechdelRating + '</p>' + '</div>');
	};
	$('.submitButton').attr("value", "Complete!");
	setTimeout(function(){
		$('.submitButton').attr("value", "Search Again");
	}, 3000);
};

$(function() {
	movieApp.results();
});