import React, { useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../libs/errorLib";
import config from "../config";
import "./NewQuestion.css";
import { API } from "aws-amplify";
import { s3Upload } from "../libs/awsLib";

export default function NewQuestion() {
  const file = useRef(null);
  const history = useHistory();
  const questionStatus = "Incomplete";
  const [questionStatement, setQuestionStatement] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function validateForm() {
    return questionStatement.length > 0;
  }

  function handleFileChange(event) {
    file.current = event.target.files[0];
  }

  async function handleSubmit(event) {
    event.preventDefault();
  
    if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${
          config.MAX_ATTACHMENT_SIZE / 1000000
        } MB.`
      );
      return;
    }
  
    setIsLoading(true);
  
    try {
      const attachment = file.current ? await s3Upload(file.current) : null;
  
      await createQuestion({ questionStatement, attachment, questionStatus });
      history.push("/");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }
  
  
  function createQuestion(question) {
    return API.post("questions", "/questions", {
      body: question
    });
  }

  return (
    <div className="NewQuestion">
      <form onSubmit={handleSubmit}>
        <FormGroup controlId="questionStatement">
          <FormControl
            value={questionStatement}
            componentClass="textarea"
            onChange={e => setQuestionStatement(e.target.value)}
          />
        </FormGroup>
        <FormGroup controlId="file">
          <ControlLabel>Attachment</ControlLabel>
          <FormControl onChange={handleFileChange} type="file" />
        </FormGroup>
        <LoaderButton
          block
          type="submit"
          bsSize="large"
          bsStyle="primary"
          isLoading={isLoading}
          disabled={!validateForm()}
        >
          Create
        </LoaderButton>
      </form>
    </div>
  );
}