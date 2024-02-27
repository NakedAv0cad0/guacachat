import { useEffect, useRef, useState } from "react";
import Nav from "../components/Nav";
import { EditorState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import useAuthRedirect from "../hooks/useAuthRedirect";
import SendMsgUI from "../components/SendMsgUI";
import { signOut } from "firebase/auth";
import { auth, q } from "../firebase";
import { onSnapshot } from "firebase/firestore";

const sendIcon = (
  <svg
    width="80"
    height="40"
    viewBox="0 0 268 84"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M109.5 1V83H267V1M109.5 1H188.25H267M109.5 1L188.25 35.5L267 1M93 18.5H0M89 35.5H38.5M93 53.5H0"
      stroke="black"
      strokeWidth="5"
    />
  </svg>
);

const Chat = () => {
  useAuthRedirect();
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [messages, setMessages] = useState([]);
  const chat = useRef();
  // scroll the chat to the bottom

  useEffect(() => {
    chat.current?.scrollTo(0, chat.current?.scrollHeight);
  }, [messages]);

  const handleClick = () => {
    if (!chat?.current || !editorState.getCurrentContent()) return;
    SendMsgUI({
      chat: chat.current,
      editorState,
      setEditorState,
      EditorState,
    });
  };

  // get the messages from the database
  useEffect(() => {
    // scrollToBottom();
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let messages = [];
      snapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messages);
    });
    return () => unsubscribe();
  }, []);

  // // "ctrl + enter" method has an issue
  // useEffect(() => {
  //   let isMounted = true;
  //   if (!isMounted) return;
  //   document.addEventListener("keydown", (e) => {
  //     if (e.ctrlKey && e.key === "Enter") {
  //       e.preventDefault();
  //       handleClick();
  //     }
  //   });
  //   return (isMounted = false);
  // }, []);

  return (
    <div id="chat" className="container">
      <Nav pageName="rooms" />
      <div ref={chat} id="messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className="message"
            dangerouslySetInnerHTML={{ __html: message.message }}
          ></div>
        ))}
      </div>

      <aside id="room">
        <h2 id="room-name">The First Chat Room</h2>
        <button id="logout" onClick={() => signOut(auth)}>
          Logout
        </button>
      </aside>

      <div id="input-field">
        <Editor
          editorState={editorState}
          onEditorStateChange={setEditorState}
          wrapperClassName="editor-wrapper"
          editorClassName="editor"
          toolbarClassName="toolbar"
          toolbar={{
            options: ["inline", "blockType", "list"],
            inline: {
              inDropdown: false,
              options: ["bold", "italic", "underline"],
            },
            blockType: {
              inDropdown: true,
              options: ["H1", "H2", "unordered-list-item", "ordered-list-item"],
            },
          }}
        />
        <div>
          <button onClick={handleClick} title="Ctrl + Enter" id="send">
            {sendIcon}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
