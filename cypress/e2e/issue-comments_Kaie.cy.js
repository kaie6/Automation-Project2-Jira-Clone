import { faker } from "@faker-js/faker";

describe("Issue comments creating, editing and deleting", () => {
  //selectors
  const getIssueDetailsModal = () =>
    cy.get('[data-testid="modal:issue-details"]');
  const getListIssue = () => cy.get('[data-testid="list-issue"]');
  const getCommentField = () =>
    cy.get('textarea[placeholder="Add a comment..."]');
  const getCommentFieldPlaceholder = () => cy.contains("Add a comment...");
  const getIssueComment = () => cy.get('[data-testid="issue-comment"]');
  const deleteConfirmationModal = () => cy.get('[data-testid="modal:confirm"]');

  //buttons
  const clickSaveCommentButton = () => {
    cy.contains("button", "Save").click().should("not.exist");
  };
  const clickEditFirstCommentButton = () => {
    getIssueComment().first().contains("Edit").click().should("not.exist");
  };
  const clickDeleteCommentButton = () => {
    getIssueComment()
      .first()
      .contains("Delete")
      .click()
      .should("not.be.visible");
  };
  const clickConfirmDeletionButton = () => {
    deleteConfirmationModal().within(() => {
      cy.contains("button", "Delete comment").click().should("not.exist");
    });
  };

  //functions
  function addComment(comment) {
    getIssueDetailsModal().within(() => {
      getCommentFieldPlaceholder().click();
      getCommentField().type(comment);
      clickSaveCommentButton();
      getCommentFieldPlaceholder().should("exist");
    });
  }

  //previousComment variable should be added if there was an edited comment, otherwise add only one variable: comment)
  function assertAddedComment(comment, previousComment) {
    getIssueDetailsModal().within(() => {
      getIssueComment()
        .first()
        .should("contain", "Edit")
        .should("contain", comment)
        .should("not.contain", previousComment);
    });
  }

  function editComment(comment, previousComment) {
    getIssueDetailsModal().within(() => {
      clickEditFirstCommentButton();

      getCommentField()
        .should("contain", previousComment)
        .clear()
        .type(comment);

      clickSaveCommentButton();
    });
  }

  function countComments() {
    return getIssueComment().its("length").as("initialCount");
  }

  function deleteFirstComment(comment) {
    //counting the comments and saving the actual count (reduced by 1) as a constant
    countComments().then((initialCount) => {
      const actualCommentCount = initialCount - 1;
      clickDeleteCommentButton(); //delete first comment
      clickConfirmDeletionButton();
      //checking if there are any comments left
      const commentCount =
        actualCommentCount > 0 ? "commentsExist" : "noComments";
      switch (commentCount) {
        case "commentsExist":
          //if comments exist then assert that the count of comments is reduced by 1
          getIssueComment().its("length").should("equal", actualCommentCount);
          getIssueComment().should("not.contain", comment);
          break;
        case "noComments":
          getIssueComment().should("not.exist");
          break;
      }
    });
  }

  beforeEach(() => {
    cy.visit("/");
    cy.url()
      .should("eq", `${Cypress.env("baseUrl")}project/board`)
      .then((url) => {
        cy.visit(url + "/board");
        getListIssue().first().click();
      });
  });

  it("Should create a comment successfully", () => {
    const comment = "TEST_COMMENT";
    addComment(comment);
    assertAddedComment(comment);
  });

  it("Should edit a comment successfully", () => {
    const previousComment = "An old silent pond...";
    const comment = "TEST_COMMENT_EDITED";

    editComment(comment, previousComment);
    assertAddedComment(comment, previousComment);
  });

  it("Should delete a comment successfully", () => {
    // Count the comments before deletion
    countComments();
    deleteFirstComment();
  });

  it("Should add, update and delete a comment successfully", () => {
    const comment1 = faker.lorem.sentence();
    const comment2 = faker.lorem.sentence();
    addComment(comment1);
    assertAddedComment(comment1);
    editComment(comment2, comment1);
    assertAddedComment(comment2, comment1);
    countComments();
    deleteFirstComment(comment2);
  });
});
