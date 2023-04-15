import { useEffect, useRef, useState } from "react";

import axios from "axios";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import CodeIcon from "@mui/icons-material/Code";
import CodeOffIcon from "@mui/icons-material/CodeOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
import CssBaseline from "@mui/material/CssBaseline";
import Slider from "@mui/material/Slider";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import Button from "@mui/material/Button";
import dynamic from "next/dynamic";

import prettier from "prettier";

function prettify(code: string) {
	try {
		return prettier.format(code, { useTabs: true, semi: true, parser: "babel" });
	} catch {
		return code;
	}
}

const MonacoEditor = dynamic(import("@monaco-editor/react"), { ssr: false });

const base = {
	default: `/** CHANGELOG
 * 1. Set up canvas
 */
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
/*60FPS draw cycle*/
function draw(){
  const FPS = 60;
  setTimeout(requestAnimationFrame(draw),1000/FPS)
}
draw();
	`.trim(),
};

const fontMono = Fira_Code({
	subsets: ["latin"],
});

const answersAtom = atomWithStorage<{ id: string; content: string; task: string }[]>("fail4", [
	{
		id: "1",
		content: base.default,
		task: "Base Script",
	},
]);

const showCodeAtom = atomWithStorage("fail4-editor", false);

export default function Home() {
	const ref = useRef<HTMLIFrameElement>(null);
	const [template, setTemplate] = useState(prettify(base.default));
	const [runningId, setRunningId] = useState("1");
	const [activeId, setActiveId] = useState("1");
	const [answers, setAnswers] = useAtom(answersAtom);
	const [showCode, setShowCode] = useAtom(showCodeAtom);
	const [loading, setLoading] = useState(false);
	const [loadingLive, setLoadingLive] = useState(true);

	const { call, subscribe } = useHost(ref, "fail4");

	const connection = useRef(false);
	const [tries, setTries] = useState(1);

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
				// call({ template: "" });

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
						setLoadingLive(false);

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

	const current = answers.find(({ id }) => id === activeId);

	function reload() {
		connection.current = false;
		if (ref.current) {
			ref.current.src = `/live?${nanoid()}`;
			setLoadingLive(true);
			setTries(1);
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
				<Stack sx={{ width: "50%", flex: 1 }}>
					<AppBar position="static" elevation={0}>
						<Toolbar>
							<Button
								form="gpt-form"
								type="submit"
								variant="outlined"
								color="inherit"
								aria-label={loading ? "Loading" : "Run"}
								aria-disabled={loading}
								disabled={loading}
								startIcon={
									loading ? <CircularProgress size={20} /> : <PlayArrowIcon />
								}
							>
								Run
							</Button>
							<Typography
								sx={{
									flex: 1,
									pl: 3,
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}
							>
								{current?.task} - {current?.id ?? ""}
							</Typography>
							<IconButton
								color="inherit"
								aria-label={showCode ? "Hide Code" : "Show Code"}
								onClick={() => {
									setShowCode(previousState => !previousState);
								}}
							>
								{showCode ? <CodeOffIcon /> : <CodeIcon />}
							</IconButton>
							<IconButton
								edge="end"
								color="inherit"
								aria-label="Clear Prompt"
								onClick={async () => {
									// broadcast({ template: base.default });
									setActiveId("1");
									setRunningId("1");
									setTemplate(prettify(base.default));
									reload();
								}}
							>
								<ClearIcon />
							</IconButton>
						</Toolbar>
					</AppBar>
					{showCode && (
						<Box sx={{ flex: 1 }}>
							<MonacoEditor
								theme="vs-dark"
								language="javascript"
								value={template}
								options={{
									fontSize: 14,
									// minimap: { enabled: false },
								}}
								onChange={async value => {
									console.log(value);
									setTemplate(value ?? "");
								}}
							/>
						</Box>
					)}
					<Stack
						sx={{ flex: 1, display: showCode ? "none" : undefined, overflow: "hidden" }}
					>
						<Box
							component="form"
							id="gpt-form"
							onSubmit={async event => {
								event.preventDefault();
								const formData = new FormData(event.target as HTMLFormElement);
								const formObject = Object.fromEntries(formData);
								try {
									setLoading(true);
									const { data } = await axios.post("/api/gpt", formObject);
									const answer = data;
									setAnswers(previousAnswers => [answer, ...previousAnswers]);
									setRunningId(answer.id);
									setActiveId(answer.id);
									reload();
								} catch (error) {
									console.error(error);
								} finally {
									setLoading(false);
								}
							}}
						>
							<Paper variant="outlined" sx={{ p: 0 }}>
								<Stack sx={{ p: 2, gap: 2 }}>
									<TextField
										multiline
										fullWidth
										id="prompt"
										name="prompt"
										label="Prompt"
										placeholder="red heart"
										defaultValue="red heart"
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
							<Accordion disableGutters square elevation={0}>
								<AccordionSummary
									expandIcon={<ExpandMoreIcon />}
									aria-controls="gtp-options-content"
									id="gtp-options-header"
									sx={{
										bgcolor: "background.paper",
										color: "text.primary",
									}}
								>
									<Typography>Options</Typography>
								</AccordionSummary>
								<AccordionDetails>
									<Stack
										spacing={2}
										direction="row"
										sx={{ mb: 2 }}
										alignItems="center"
									>
										<AcUnitIcon />
										<Slider
											marks
											id="temperature"
											name="temperature"
											min={0}
											max={0.8}
											defaultValue={0.2}
											step={0.1}
											valueLabelDisplay="auto"
											aria-label="Temperature"
										/>
										<LocalFireDepartmentIcon />
									</Stack>
									<input
										id="template"
										name="template"
										type="hidden"
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
															setAnswers(previousAnswers =>
																previousAnswers.filter(
																	({ id }) => id !== answer.id
																)
															);
															if (runningId === answer.id) {
																setActiveId("1");
																setRunningId("1");
																setTemplate(prettify(base.default));
																reload();
															}
														}}
													>
														<DeleteForeverIcon />
													</IconButton>
												)}
											</Stack>
										}
										disablePadding
									>
										<ListItemButton
											dense
											selected={activeId === answer.id}
											disabled={activeId === answer.id}
											role={undefined}
											onClick={() => {
												setActiveId(answer.id);
												setRunningId(answer.id);
												setTemplate(prettify(answer.content));
												reload();
											}}
										>
											<ListItemIcon>
												{runningId === answer.id ? (
													<CheckIcon />
												) : (
													<VisibilityIcon />
												)}
											</ListItemIcon>
											<ListItemText
												primary={`${answer.task} - ${answer.id}`}
												primaryTypographyProps={{
													sx: {
														overflow: "hidden",
														textOverflow: "ellipsis",
														whiteSpace: "nowrap",
													},
												}}
											/>
										</ListItemButton>
									</ListItem>
								);
							})}
						</List>
					</Stack>
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
