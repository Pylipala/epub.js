//综合来看，这个类维护了每页开始的CFI，木有多的花花肠子

EPUBJS.Pagination = function(pageList) {
	this.pages = [];
	this.locations = [];
	this.epubcfi = new EPUBJS.EpubCFI();
	if(pageList && pageList.length) {
		this.process(pageList);
	}
};


//从这个处理函数看，一个Pagination对象装的应该是一章的页，而不是整本书的
//因为它用最后页码来减第一页的页码，问题是为什么没有加一呢？
EPUBJS.Pagination.prototype.process = function(pageList){
	pageList.forEach(function(item){
		this.pages.push(item.page);
		this.locations.push(item.cfi);
	}, this);

	this.pageList = pageList;
	this.firstPage = parseInt(this.pages[0]);
	this.lastPage = parseInt(this.pages[this.pages.length-1]);
	this.totalPages = this.lastPage - this.firstPage;
};

//找到一个Canonical Fragment Identifier出现在第几页
//这个函数应该还没写完，里面“没有找到”的分支逻辑乱乱的。先不看了。
EPUBJS.Pagination.prototype.pageFromCfi = function(cfi){
	var pg = -1;

	// Check if the pageList has not been set yet
	if(this.locations.length === 0) {
		return -1;
	}

	// TODO: check if CFI is valid?

	// check if the cfi is in the location list
	// var index = this.locations.indexOf(cfi);
	var index = EPUBJS.core.indexOfSorted(cfi, this.locations, this.epubcfi.compare);
	if(index != -1 && index < (this.pages.length-1) ) {
		pg = this.pages[index];
	} else {
		// Otherwise add it to the list of locations
		// Insert it in the correct position in the locations page
		//index = EPUBJS.core.insert(cfi, this.locations, this.epubcfi.compare);
		index = EPUBJS.core.locationOf(cfi, this.locations, this.epubcfi.compare);
		// Get the page at the location just before the new one, or return the first
		pg = index-1 >= 0 ? this.pages[index-1] : this.pages[0];
		pg = this.pages[index];
		if(pg !== undefined) {
			// Add the new page in so that the locations and page array match up
			//this.pages.splice(index, 0, pg);
		} else {
			pg = -1;
		}

	}
	return pg;
};

// 找到指定页的CFI
EPUBJS.Pagination.prototype.cfiFromPage = function(pg){
	var cfi = -1;
	// check that pg is an int
	if(typeof pg != "number"){
		pg = parseInt(pg);
	}

	// check if the cfi is in the page list
	// Pages could be unsorted.
	var index = this.pages.indexOf(pg);
	if(index != -1) {
		cfi = this.locations[index];
	}
	// TODO: handle pages not in the list
	return cfi;
};

//根据百分比算页码
//奇怪啊，根据前面的结论，这是一章，那么百分比就没啥子用嘛。
EPUBJS.Pagination.prototype.pageFromPercentage = function(percent){
	var pg = Math.round(this.totalPages * percent);
	return pg;
};

// Returns a value between 0 - 1 corresponding to the location of a page
EPUBJS.Pagination.prototype.percentageFromPage = function(pg){
	var percentage = (pg - this.firstPage) / this.totalPages;
	return Math.round(percentage * 1000) / 1000;
};

// Returns a value between 0 - 1 corresponding to the location of a cfi
EPUBJS.Pagination.prototype.percentageFromCfi = function(cfi){
	var pg = this.pageFromCfi(cfi);
	var percentage = this.percentageFromPage(pg);
	return percentage;
};
