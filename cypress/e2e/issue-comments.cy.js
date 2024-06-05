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

  function assertAddedComment(comment) {
    getIssueDetailsModal().within(() => {
      getIssueComment().should("contain", "Edit").should("contain", comment);
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

  function deleteFirstComment() {
    clickDeleteCommentButton();
    clickConfirmDeletionButton();
    getIssueComment().should("not.exist");
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
    assertAddedComment(comment);
  });

  it.only("Should delete a comment successfully", () => {
    deleteFirstComment();
  });

  it("Should add, update and delete a comment successfully", () => {});
});
