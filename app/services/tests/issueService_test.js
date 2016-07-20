describe("issue service", function () {
    var issueService, httpBackend, baseUrl, $q, root;
    beforeEach(function () {
        angular.mock.module("cliffhanger.issue");
        inject(function ($injector, $httpBackend) {
            issueService = $injector.get("issueService");
            httpBackend = $injector.get("$httpBackend");
            $q = $injector.get("$q");
            root = $injector.get("$rootScope");
            baseUrl = ($injector.get("$rootScope")).baseUrl;
        });
    });
    //create issue
    it('should be able to create an issue', function () {
        //TODO
        root.user = {
            username: 'hdfs'
        }
        var issue = {
            subject: 'test subject'
            , body: 'test body'
        }
        httpBackend.expect('post', baseUrl + '/discussionThread/create', issue).respond(200);
        issueService.createIssue(issue);
    });
    //get all issues
    it('should be able to get all issues', function () {
        httpBackend.expect('get', baseUrl + '/discussionThread/list').respond(200);
        issueService.getAllIssues();
    });
    //toggle issue open
    it('should be able to toggle an issue open/close', function () {
        var threadId = 1;
        var closerUsername = 'hdfs';
        var closer = {
            closer: closerUsername
        }
        httpBackend.expect('put', baseUrl + '/discusssionThread/toggleOpen/' + threadId, closer).respond(200);
        issueService.toggleOpen(threadId, closerUsername);
    });
    //post comment
    it('should be able to post a comment to an issue', function () {
        var newComment = {
            threadId: 1
            , body: "new comment"
            , userId: "hdfs"
        }
        httpBackend.expect('post', baseUrl + '/comment/post', newComment).respond(200);
        issueService.postComment(newComment);
    });
    //get comments for issue
    it('should be able to get all comments for an issue', function () {
        var threadId = 1;
        httpBackend.expect('get', baseUrl + '/comment/getAllByThreadId/' + threadId).respond(200);
        issueService.getComments(1);
    });
});