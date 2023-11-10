import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import VirtualScroll from "virtual-scroll";
import "./main.scss";

const useAnimationFrame = (callback) => {
    // Use useRef for mutable variables that we want to persist
    // without triggering a re-render on their change
    const requestRef = useRef();
    const previousTimeRef = useRef();

    const animate = (time) => {
        if (previousTimeRef.current != undefined) {
            const deltaTime = time - previousTimeRef.current;
            callback(deltaTime);
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []); // Make sure the effect runs only once
};

function App() {
    const videoRef = useRef();
    const baseTimeFactor = 1.5;
    const timeFactor = useRef(1);
    const scrollDelta = useRef(0);
    const scrollDirection = useRef(baseTimeFactor);
    const currentTime = useRef(0);
    const [mouseDown, setMouseDown] = useState(false);
    const mouseDownRef = useRef(false);

    useEffect(() => {
        gsap.to(timeFactor, {
            current: mouseDown ? 0 : baseTimeFactor,
            duration: 1,
            ease: "expo.out",
        });
    }, [mouseDown]);

    useEffect(() => {
        const scroller = new VirtualScroll();

        const scrollHandler = (event) => {
            if (event.deltaY < 0) {
                scrollDirection.current = 1;
            } else {
                scrollDirection.current = -1;
            }

            gsap.to(scrollDelta, {
                current: Math.abs(event.deltaY) > 6 ? event.deltaY * -1 : 0,
                duration: 2,
                ease: "expo.out",
            });
        };

        scroller.on(scrollHandler);

        return () => {
            scroller.off(scrollHandler);
        };
    }, []);

    useAnimationFrame((deltaTime) => {
        const timeInput = (deltaTime / 1000) * scrollDirection.current * timeFactor.current;
        const scrollInput = scrollDelta.current / 1000;

        // Add the timeInput and scrollInputs to the currentTime ref
        currentTime.current = currentTime.current + timeInput + scrollInput;

        // loop values less than zero back around from the end
        if (currentTime.current < 0) {
            currentTime.current = videoRef.current.duration + currentTime.current;
        }

        // Update the actual videos currentTime, using modulo to stay within the video duration
        if (videoRef.current.duration) {
            videoRef.current.currentTime = currentTime.current % videoRef.current.duration;
        }
    });

    return (
        <main onClick={() => setMouseDown(!mouseDown)}>
            <video
                ref={videoRef}
                src="https://simple-creature-website-assets.s3.amazonaws.com/video-scrubber/feature-2-video-demo-matcap-trim-1k.mp4"
                muted
                loop
            />
        </main>
    );
}

export default App;
