import * as React from "react";
import { useState, useEffect } from "react";
import * as ReactDOMClient from "react-dom/client";
import {
  Flex,
  Text,
  Icon,
  ChakraProvider,
  IconButton,
  useColorMode,
  useColorModeValue,
  Button,
  useToast
} from "@chakra-ui/react";

import { ArrowUpIcon, ArrowDownIcon } from "@chakra-ui/icons";
import { MdRestartAlt, MdPlayArrow, MdPause } from "react-icons/md";

const startBeep = require("../beep.mp3");
const endBeep = require("../beep2.mp3");

function secondsToDate(time) {
  let minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return minutes + ":" + seconds;
}

function App() {
  const { toggleColorMode } = useColorMode();
  const toast = useToast();

  const [breakLength, setBreakLength] = useState(5);
  const [sessionLength, setSessionLength] = useState(25);
  const [timeRemain, setTimeRemain] = useState(1500);
  const [timeDisplay, setTimeDisplay] = useState("25:00");
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  const startAudio = document.querySelector("#startBeep");
  const endAudio = document.querySelector("#endBeep");

  useEffect(() => {
    let interval = null;

    if (isActive && !isBreak && timeRemain > 0) {
      interval = setInterval(() => {
        setTimeRemain((prev) => prev - 1);
        setTimeDisplay(secondsToDate(timeRemain - 1));
      }, 1000);
    } else if (isActive && !isBreak && timeRemain === 0) {
      setTimeRemain(breakLength * 60);
      setIsBreak(true);
      toast({
        title: "Pomodoro completed.",
        description:
          "Congratulations, you have finished your pomodoro! Your break of " +
          breakLength +
          " minutes is starting.",
        status: "success",
        duration: 5000,
        isClosable: true
      });
      endAudio.play();
    } else if (isActive && isBreak && timeRemain > 0) {
      interval = setInterval(() => {
        setTimeRemain((prev) => prev - 1);
        setTimeDisplay(secondsToDate(timeRemain - 1));
      }, 1000);
    } else if (isActive && isBreak && timeRemain === 0) {
      setTimeRemain(sessionLength * 60);
      setTimeDisplay(secondsToDate(sessionLength * 60));
      setIsBreak(false);
      setIsActive(false);
      toast({
        title: "Break completed.",
        description: "Your break is over. Time to get back to work!",
        status: "success",
        duration: 5000,
        isClosable: true
      });
      endAudio.play();
    } else {
      clearInterval(interval);
    }
    return () => {
      clearInterval(interval);
    };
  }, [
    timeRemain,
    timeDisplay,
    isActive,
    isBreak,
    sessionLength,
    breakLength,
    toast,
    startAudio,
    endAudio
  ]);
  function handleBreakChange(e) {
    if (e.currentTarget.id === "inc") {
      setBreakLength((prev) => prev + 1);
    } else if (e.currentTarget.id === "dec") {
      setBreakLength((prev) => (prev > 1 ? prev - 1 : prev));
    }
  }

  function handleSessionChange(e) {
    if (e.currentTarget.id === "inc") {
      setIsActive(false);
      setSessionLength((prev) => prev + 1);
      setTimeRemain((sessionLength + 1) * 60);
      setTimeDisplay((prev) => secondsToDate((sessionLength + 1) * 60));
    } else if (e.currentTarget.id === "dec" && sessionLength > 1) {
      setIsActive(false);
      setSessionLength((prev) => prev - 1);
      setTimeDisplay((prev) => secondsToDate((sessionLength - 1) * 60));
      setTimeRemain((sessionLength - 1) * 60);
    }
  }

  function handleStart() {
    if (sessionLength * 60 === timeRemain) {
      toast({
        title: "Pomodoro started",
        description:
          "Your pomodoro timer has started, with a duration of " +
          sessionLength +
          " minutes.",
        status: "success",
        duration: 5000,
        isClosable: true
      });
      startAudio.play();
    } else {
      toast({
        title: "Pomodoro resumed.",
        description: "Your pomodoro timer has resumed.",
        status: "info",
        duration: 5000,
        isClosable: true
      });
    }
    setIsActive(true);
  }

  function handlePause() {
    setIsActive(false);
    toast({
      title: "Pomodoro paused",
      description: "Your pomodoro timer has been paused.",
      status: "info",
      duration: 5000,
      isClosable: true
    });
  }

  function handleRestart() {
    if (isActive) {
      setIsActive(false);
      setIsBreak(false);
      setTimeRemain(sessionLength * 60);
      setTimeDisplay(secondsToDate(sessionLength * 60));
      toast({
        title: "Pomodoro restarted.",
        description: "Your pomodoro timer has been restarted.",
        status: "info",
        duration: 5000,
        isClosable: true
      });
    }
  }

  return (
    <Flex
      width="100vw"
      height="100vh"
      justifyContent="center"
      alignItems="center"
      direction="column">
      <Text fontWeight="black" fontSize="xx-large">
        Pomodoro Timer
      </Text>
      <Flex>
        <Flex direction="column" margin={4}>
          <Text fontWeight="medium" fontSize="xl">
            Break Length
          </Text>
          <Flex justifyContent="center" alignItems="center">
            <IconButton
              id="inc"
              icon={<ArrowUpIcon />}
              onClick={handleBreakChange}></IconButton>
            <Text padding={4}>{breakLength}</Text>
            <IconButton
              id="dec"
              icon={<ArrowDownIcon />}
              onClick={handleBreakChange}></IconButton>
          </Flex>
        </Flex>
        <Flex direction="column" margin={4}>
          <Text fontWeight="medium" fontSize="xl">
            Session Length
          </Text>
          <Flex justifyContent="center" alignItems="center">
            <IconButton
              id="inc"
              icon={<ArrowUpIcon />}
              onClick={handleSessionChange}></IconButton>
            <Text padding={4}>{sessionLength}</Text>
            <IconButton
              id="dec"
              icon={<ArrowDownIcon />}
              onClick={handleSessionChange}></IconButton>
          </Flex>
        </Flex>
      </Flex>

      <Flex
        direction="column"
        alignItems="center"
        border="4px"
        borderColor="gray.500"
        paddingTop={2}
        paddingBottom={2}
        paddingLeft={4}
        paddingRight={4}
        mb={4}
        rounded="xl">
        <Text fontSize="xl">{isBreak ? "Break" : "Session"}</Text>
        <Text fontSize="2xl" fontWeight="medium">
          {timeDisplay}
        </Text>
      </Flex>
      <Flex mb={5}>
        <IconButton
          icon={<Icon as={MdPlayArrow} onClick={handleStart} />}></IconButton>
        <IconButton
          ml={4}
          mr={4}
          icon={<Icon as={MdPause} />}
          onClick={handlePause}></IconButton>
        <IconButton
          icon={<Icon as={MdRestartAlt} />}
          onClick={handleRestart}></IconButton>
      </Flex>
      <Button onClick={toggleColorMode}>Toggle Darkmode</Button>
      <audio id="startBeep" src={startBeep} />
      <audio id="endBeep" src={endBeep} />
    </Flex>
  );
}

const rootElement = document.getElementById("root");
const root = ReactDOMClient.createRoot(rootElement);

root.render(
  <ChakraProvider>
    <App />
  </ChakraProvider>
);
