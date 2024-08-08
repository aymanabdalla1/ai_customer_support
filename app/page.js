"use client";

import { Box, Stack, TextField, Button, Typography, Avatar } from "@mui/material";
import { useEffect, useState, useRef} from "react";

export default function Home() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: `Hi! I'm the Headstarter Support Agent! How can I help you today?`,
  }]);

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true)

    if (!message.trim()) return;

    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ])

    try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    })
    
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const text = decoder.decode(value, { stream: true })
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1]
        let otherMessages = messages.slice(0, messages.length - 1)
        return [
          ...otherMessages,
          { ...lastMessage, content: lastMessage.content + text },
        ]
      })
    }
  } catch (error) {
    console.error('Error:', error)
    setMessages((messages) => [
      ...messages,
      { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
    ])
  }

  setIsLoading(false)
}

const handleKeyPress = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const messagesEndRef = useRef(null)

const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
}

useEffect(() => {
  scrollToBottom()
}, [messages])

  return (
    <Box
      bgcolor="#DEE1E1"
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        bgcolor="white"
        direction="column"
        width="650px"
        height="800px"
        border="2px solid black"
        borderRadius={7}
        p={2}
        spacing={2}
      >
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          p={1}
          spacing={2}
        >
          <Box textAlign="center">
            <Typography
              fontFamily="Raleway, Arial"
              fontWeight="bold"
              fontSize={20}
            >
              HeadStarter Support Agent
            </Typography>
          </Box>
          <Avatar
            alt="HeadStarter"
            src="cant-find-image"
            sx={{ width: 56, height: 56 }}
          />
        </Stack>
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages
            .filter((message) => message.content.trim() !== "")
            .map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === "assistant" ? "flex-start" : "flex-end"
                }
              >
                <Box
                  bgcolor={
                    message.role === "assistant" ? "primary.main" : "	#4ac925"
                  }
                  color="white"
                  borderRadius={14}
                  p={3}
                >
                  {message.content}
                </Box>
              </Box>
            ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Type a message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
