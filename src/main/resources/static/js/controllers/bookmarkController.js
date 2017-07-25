(function(){
angular.module('app')
    .controller('BookmarkController', BookmarkController);
    
    BookmarkController.$inject = ['$filter', 'BookmarkService', 'CategoryService', 'uibDateParser', '$scope'];
   
    function BookmarkController($filter, BookmarkService, CategoryService, uibDateParser, $scope) {
        
        var vm = this;
        vm.saveBookmark = saveBookmark;
        vm.bookmarkShare = bookmarkShare;
        vm.getCategories = getCategories;
        vm.getBookmarks = getBookmarks;
        vm.deleteBookmark = deleteBookmark;
        vm.selectBookmark = selectBookmark;
        vm.addModalOperation = addModalOperation;
        vm.editModalOperation = editModalOperation;
        vm.shareBookmark = shareBookmark;
        vm.operation = {};
        vm.selectedBookmark = {};
        vm.bookmarks = {};
        vm.bookmark = {};
        vm.categories = {};
        vm.tags = {};
        vm.category = {};

        init();
    
        function init() {
        	  delete vm.tags;
            delete vm.category;
            delete vm.bookmark;
            delete vm.error;
            vm.closeModal = false;
            getCategories();
            if($scope.$parent.vm.user){
            	getBookmarks();
            }
        }

        function selectBookmark(bookmark) {
        	if(vm.selectedBookmark == bookmark) {
        		vm.selectedBookmark = null;
        	}
        	else {
        		vm.selectedBookmark = bookmark;
        	}
        }
        
        function getBookmarks(){
            BookmarkService.getBookmarks().then(handleSuccessBookmarks);
        }
        
        function handleSuccessBookmarks(data, status) {
            vm.bookmarks = data;
        }

        function saveBookmark(bookmark) {
          if(vm.operation.name == "Edit bookmark") {
                bookmark.id = vm.selectedBookmark.id;
            }          
                  
        	vm.error = null;
          
        	if((!bookmark.title && !bookmark.url && !vm.category)
        		|| (!bookmark.title && !bookmark.url && vm.category)
        		|| (!bookmark.title && bookmark.url && !vm.category)
        		|| (bookmark.title && !bookmark.url && !vm.category)) {
        		vm.error = "Please fill in all fields!";
        		return;
        	}         
          if(bookmark.title && bookmark.url && !vm.category) {
            vm.error = "Please choose a category!";
            return;
          }         
          if(bookmark.title && !bookmark.url && vm.category) {
            vm.error = "Please specify a URL!";
            return;
          }      
          if(!bookmark.title && bookmark.url && vm.category) {		
            vm.error = "Please specify a title!";
            return;
          }

        	var username = {};
        	username.username = $scope.$parent.vm.user.name;
        	bookmark.user = username;
        	
        	if(vm.tags){
	        	var tagsToSend = [];
	            var temp = vm.tags.split(' ');
	
	            temp.forEach(function(t) {
	                var tag = {};
	                tag.name = t;
	                tagsToSend.push(tag);
	            });
	            
	            bookmark.tags = tagsToSend;
        	}
        	else{
        		bookmark.tags = [];
        	}
        	
        	if(!bookmark.description){
        		bookmark.description = "default";
        	}

            bookmark.date = new Date();
            bookmark.date = $filter('date')(bookmark.date, "yyyy-MM-dd");

            bookmark.category = vm.categories[vm.category - 1];    

            BookmarkService.saveBookmark(bookmark).then(function(response){
                $('#addBookmarkModal').modal('hide');
                init();
            }, function(error){
                vm.error = error;
            })         
        }

        function bookmarkShare(state){
        	vm.bookmark.visibility = state;
        }

        function getCategories() {
            CategoryService.getCategories().then(handleSuccessCategories);
        }

        function handleSuccessCategories(data, status){
            vm.categories = data;
        }

        function deleteBookmark(){
            BookmarkService.deleteBookmark(vm.selectedBookmark.id).then(function(response){
                getBookmarks();
            }, function(error){

            });
            vm.selectedBookmark= {};
        }
        
        function addModalOperation() {
            delete vm.bookmark;
            vm.operation.name = "Add bookmark";
            console.log(vm.operation.name);
        }
        
        function editModalOperation() {
            vm.operation.name = "Edit bookmark";
            console.log(vm.operation.name);
            vm.error = {};
            vm.bookmark = angular.copy(vm.selectedBookmark);
            vm.bookmark.date = new Date();
            vm.bookmark.date = $filter('date')(vm.bookmark.date, "yyyy-MM-dd");
        }
        
        function shareBookmark() {
            vm.bookmark = angular.copy(vm.selectedBookmark);
            vm.bookmark.id = vm.selectedBookmark.id;
            vm.bookmark.visibility = true;
            BookmarkService.saveBookmark(vm.bookmark);
            console.log("changed?");
        }
    };
})();
