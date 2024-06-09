import IssueComment from "../../pages/IssueComment";

import { faker } from "@faker-js/faker";

describe("Issue comments creating, editing and deleting", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.url()
      .should("eq", `${Cypress.env("baseUrl")}project/board`)
      .then((url) => {
        cy.visit(url + "/board");
        IssueComment.getListIssue().first().click();
      });
  });

  it("Should create a comment successfully", () => {
    const comment = "TEST_COMMENT";
    IssueComment.addComment(comment);
    IssueComment.assertAddedComment(comment);
  });

  it("Should edit a comment successfully", () => {
    const previousComment = "An old silent pond...";
    const comment = "TEST_COMMENT_EDITED";

    IssueComment.editComment(comment, previousComment);
    IssueComment.assertAddedComment(comment, previousComment);
  });

  it("Should delete a comment successfully", () => {
    // Count the comments before deletion
    IssueComment.countComments();
    IssueComment.deleteFirstComment();
  });

  it("Should add, update and delete a comment successfully", () => {
    const comment1 = faker.lorem.sentence();
    const comment2 = faker.lorem.sentence();

    IssueComment.addComment(comment1);
    IssueComment.assertAddedComment(comment1);
    IssueComment.editComment(comment2, comment1);
    IssueComment.assertAddedComment(comment2, comment1);
    IssueComment.countComments();
    IssueComment.deleteFirstComment(comment2);
  });
});
