class IssueComment {
  constructor() {
    this.IssueDetailsModal = '[data-testid="modal:issue-details"]';
    this.listIssue = '[data-testid="list-issue"]';
    this.commentField = 'textarea[placeholder="Add a comment..."]';
    this.issueComment = '[data-testid="issue-comment"]';
    this.deleteConfirmationModal = '[data-testid="modal:confirm"]';
    this.getCommentFieldPlaceholder = () => cy.contains("Add a comment...");
    this.getListIssue = () => cy.get('[data-testid="list-issue"]');
  }

  clickSaveCommentButton() {
    cy.contains("button", "Save").click().should("not.exist");
  }

  clickEditFirstCommentButton() {
    cy.get(this.issueComment)
      .first()
      .contains("Edit")
      .click()
      .should("not.exist");
  }

  clickDeleteCommentButton() {
    cy.get(this.issueComment)
      .first()
      .contains("Delete")
      .click()
      .should("not.be.visible");
  }

  clickConfirmDeletionButton() {
    cy.get(this.deleteConfirmationModal).within(() => {
      cy.contains("button", "Delete comment").click().should("not.exist");
    });
  }

  addComment(comment) {
    cy.get(this.IssueDetailsModal).within(() => {
      this.getCommentFieldPlaceholder().click();
      cy.get(this.commentField).type(comment);
      this.clickSaveCommentButton();
      this.getCommentFieldPlaceholder().should("exist");
    });
  }

  //previousComment variable should be added if there was an edited comment, otherwise add only one variable: comment)
  assertAddedComment(comment, previousComment) {
    cy.get(this.IssueDetailsModal).within(() => {
      cy.get(this.issueComment)
        .first()
        .should("contain", "Edit")
        .should("contain", comment)
        .should("not.contain", previousComment);
    });
  }

  editComment(comment, previousComment) {
    cy.get(this.IssueDetailsModal).within(() => {
      this.clickEditFirstCommentButton();

      cy.get(this.commentField)
        .should("contain", previousComment)
        .clear()
        .type(comment);

      this.clickSaveCommentButton();
    });
  }

  countComments() {
    return cy.get(this.issueComment).its("length").as("initialCount");
  }

  deleteFirstComment(comment) {
    //counting the comments and saving the actual count (reduced by 1) as a constant
    this.countComments().then((initialCount) => {
      const actualCommentCount = initialCount - 1;
      this.clickDeleteCommentButton(); //delete first comment
      this.clickConfirmDeletionButton();
      //checking if there are any comments left
      const commentCount =
        actualCommentCount > 0 ? "commentsExist" : "noComments";
      switch (commentCount) {
        case "commentsExist":
          //if comments exist then assert that the count of comments is reduced by 1
          cy.get(this.issueComment)
            .its("length")
            .should("equal", actualCommentCount);
          cy.get(this.issueComment).should("not.contain", comment);
          break;
        case "noComments":
          cy.get(this.issueComment).should("not.exist");
          break;
      }
    });
  }
}

export default new IssueComment();
