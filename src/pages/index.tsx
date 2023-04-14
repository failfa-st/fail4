import { useEffect, useRef, useState } from "react";

import axios from "axios";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import TextField from "@mui/material/TextField";
import { Fira_Code } from "next/font/google";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import Typography from "@mui/material/Typography";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { nanoid } from "nanoid";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useHost } from "esdeka/react";
import CircularProgress from "@mui/material/CircularProgress";
import { miniPrompt } from "@/services/api";
import CssBaseline from "@mui/material/CssBaseline";

const base = {
	default: miniPrompt`const canvas = document.querySelector('canvas');
				const ctx = canvas.getContext('2d');
				/*60FPS draw cycle*/
				function draw(){
					const FPS = 60;
					setTimeout(requestAnimationFrame(draw),1000/FPS)
				}
				draw();
			`,
};

const fontMono = Fira_Code({
	subsets: ["latin"],
});

export default function Home() {
	const ref = useRef<HTMLIFrameElement>(null);
	const [template, setTemplate] = useState(base.default);
	const [runningId, setRunningId] = useState("1");
	const [activeId, setActiveId] = useState("1");
	const [answers, setAnswers] = useState<{ id: string; content: string; task: string }[]>([
		{
			id: "1",
			content: base.default,
			task: "Base Script",
		},
	]);
	const [loading, setLoading] = useState(false);
	const [loadingLive, setLoadingLive] = useState(true);

	const { broadcast, call, subscribe } = useHost(ref, "fail4");

	const connection = useRef(false);
	const [tries, setTries] = useState(5);

	// Send a connection request
	useEffect(() => {
		const current = answers.find(({ id }) => id === runningId);
		if (connection.current || tries <= 0) {
			return () => {
				/* Consistency */
			};
		}

		const timeout = setTimeout(() => {
			if (current) {
				call({ template: current.content });
			}

			setTries(tries - 1);
		}, 1_000);

		return () => {
			clearTimeout(timeout);
		};
	}, [call, tries, answers, runningId]);

	useEffect(() => {
		if (!connection.current && loadingLive) {
			const unsubscribe = subscribe(event => {
				const { action } = event.data;
				switch (action.type) {
					case "answer":
						connection.current = true;
						setTimeout(() => {
							setLoadingLive(false);
						}, 1_500);
						console.log("connected");
						break;
					default:
						break;
				}
			});
			return () => {
				unsubscribe();
			};
		}
		return () => {
			/* Consistency */
		};
	}, [subscribe, loadingLive]);

	// Broadcast store to guest
	useEffect(() => {
		const current = answers.find(({ id }) => id === runningId);
		if (connection.current && current) {
			broadcast({ template: current.content });
		}
		return () => {
			/* Consistency */
		};
	}, [broadcast, runningId, answers]);

	// useEffect(() => {
	// 	const current = answers.find(({ id }) => id === runningId);
	// 	if (current) {
	// 		void axios.post("/api/run", {
	// 			content: current.content,
	// 		});
	// 	}
	// }, [runningId, answers]);

	const current = answers.find(({ id }) => id === activeId);

	function reload() {
		connection.current = false;
		if (ref.current) {
			ref.current.src = `/live?${nanoid()}`;
			setLoadingLive(true);
			setTries(3);
		}
	}

	return (
		<>
			<CssBaseline />

			<Stack
				sx={{
					...fontMono.style,
					position: "absolute",
					inset: 0,
					overflow: "hidden",
					flexDirection: "row",
					height: "100%",
				}}
			>
				<Stack sx={{ width: "50%", flex: 1, gap: 2 }}>
					<Box
						component="form"
						onSubmit={async event => {
							event.preventDefault();
							const formData = new FormData(event.target as HTMLFormElement);
							const formObject = Object.fromEntries(formData);
							try {
								setLoading(true);
								const { data } = await axios.post("/api/gpt", formObject);
								const answer = data;
								setAnswers([answer, ...answers]);
								setRunningId(answer.id);
								reload();
							} catch (error) {
								console.error(error);
							} finally {
								setLoading(false);
							}
						}}
					>
						<AppBar position="static" elevation={0}>
							<Toolbar>
								<IconButton
									type="submit"
									edge="start"
									color="inherit"
									aria-label={loading ? "Loading" : "Run"}
									disabled={loading}
								>
									{loading ? <HourglassTopIcon /> : <PlayArrowIcon />}
								</IconButton>
								<Typography sx={{ flex: 1 }}>
									{current?.task} - {current?.id ?? ""}
								</Typography>
								<IconButton
									edge="end"
									color="inherit"
									aria-label="Clear Prompt"
									onClick={async () => {
										broadcast({ template: base.default });
										setActiveId("1");
										setTemplate(base.default);
										reload();
									}}
								>
									<ClearIcon />
								</IconButton>
							</Toolbar>
						</AppBar>
						<Paper variant="outlined" sx={{ p: 0 }}>
							<Stack sx={{ p: 2, gap: 2 }}>
								<Typography>
									Based on: {current?.task ?? "Base Script"} - {activeId}
								</Typography>
								<TextField
									multiline
									fullWidth
									id="prompt"
									name="prompt"
									label="Prompt"
									placeholder="add a red box"
									maxRows={6}
									InputProps={{
										style: fontMono.style,
									}}
								/>
								<TextField
									multiline
									fullWidth
									id="negativePrompt"
									name="negativePrompt"
									label="Negative Prompt"
									placeholder="images, audio files"
									maxRows={6}
									InputProps={{
										style: fontMono.style,
									}}
								/>
							</Stack>
						</Paper>
						<Accordion>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon />}
								aria-controls="panel1a-content"
								id="panel1a-header"
							>
								<Typography>Options</Typography>
							</AccordionSummary>
							<AccordionDetails>
								<TextField
									multiline
									fullWidth
									id="template"
									name="template"
									label="Template"
									placeholder={base.default}
									maxRows={6}
									value={template}
									InputProps={{
										style: { ...fontMono.style },
									}}
									onChange={event => {
										setTemplate(event.target.value);
									}}
								/>
							</AccordionDetails>
						</Accordion>
					</Box>

					<List sx={{ flex: 1, overflow: "auto" }}>
						{answers.map(answer => {
							return (
								<ListItem
									key={answer.id}
									secondaryAction={
										<Stack sx={{ flexDirection: "row", gap: 1 }}>
											{answer.id === "1" ? undefined : (
												<IconButton
													edge="end"
													aria-label="Delete"
													onClick={() => {
														setAnswers(
															answers.filter(
																({ id }) => id !== answer.id
															)
														);
													}}
												>
													<DeleteForeverIcon />
												</IconButton>
											)}
											<IconButton
												edge="end"
												aria-label="Show"
												onClick={() => {
													setRunningId(answer.id);
													reload();
												}}
											>
												{runningId === answer.id ? (
													<VisibilityIcon />
												) : (
													<VisibilityOffIcon />
												)}
											</IconButton>
										</Stack>
									}
									disablePadding
								>
									<ListItemButton
										dense
										selected={activeId === answer.id}
										role={undefined}
										onClick={() => {
											setActiveId(answer.id);
											setTemplate(answer.content);
										}}
									>
										<ListItemIcon>
											{activeId === answer.id ? (
												<CheckIcon />
											) : (
												<ContentCopyIcon />
											)}
										</ListItemIcon>
										<ListItemText primary={`${answer.task} - ${answer.id}`} />
									</ListItemButton>
								</ListItem>
							);
						})}
					</List>
				</Stack>
				<Stack sx={{ flex: 1, width: "50%", position: "relative" }}>
					<AppBar position="static" elevation={0}>
						<Toolbar>
							<IconButton
								color="inherit"
								aria-label="Reload"
								onClick={() => {
									reload();
								}}
							>
								<ReplayIcon />
							</IconButton>
						</Toolbar>
					</AppBar>
					{loadingLive && (
						<Box
							sx={{
								position: "absolute",
								zIndex: 100,
								top: "50%",
								left: "50%",
								transform: "translate(-50%,-50%)",
							}}
						>
							<CircularProgress />
						</Box>
					)}
					<Box
						ref={ref}
						component="iframe"
						sx={{
							width: "100%",
							flex: 1,
							m: 0,
							border: 0,
							overflow: "hidden",
							visibility: loadingLive ? "hidden" : undefined,
						}}
						src="/live"
					/>
				</Stack>
			</Stack>
		</>
	);
}
