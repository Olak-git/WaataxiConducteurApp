import { CommonActions } from '@react-navigation/native';
import { Icon } from '@rneui/base';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import tw from 'twrnc';

interface RNDatePickerProps {
}
const RNDatePicker: React.FC<RNDatePickerProps> = ({}) => {
    const [openDate, setOpenDate] = useState(false);
    const [date, setDate] = useState('');
    const [dates, setDates] = useState<any>([]);

    const [openMonth, setOpenMonth] = useState(false);
    const [month, setMonth] = useState('');
    const [months, setMonths] = useState<any>([]);

    const [openYear, setOpenYear] = useState(false);
    const [year, setYear] = useState('');
    const [years, setYears] = useState<any>([]);

    const [openHour, setOpenHour] = useState(false);
    const [hour, setHour] = useState('');
    const [hours, setHours] = useState<any>([]);

    const [openMinute, setOpenMinute] = useState(false);
    const [minute, setMinute] = useState('');
    const [minutes, setMinutes] = useState<any>([]);
    
    const minimumDate = new Date();

    const handleDate = () => {
        let dates = [];
        for (let index = 0; index <= 31; index++) {
            if(index==0) {
                dates.push({
                    label: 'DD',
                    value: ''
                })
            } else {
                dates.push({
                    label: index.toString().padStart(2, '0'),
                    value: index.toString().padStart(2, '0')
                })
            }
        }
        setDates(dates)
    }
    const handleMonth = () => {
        let months = [];
        for (let index = 0; index <= 12; index++) {
            if(index==0) {
                months.push({
                    label: 'MM',
                    value: ''
                })
            } else {
                months.push({
                    label: index.toString().padStart(2, '0'),
                    value: index.toString().padStart(2, '0')
                })
            }
        }
        setMonths(months)
    }
    const handleYear = () => {
        let years = [];
        const init = minimumDate.getFullYear() - 1
        for (let index = init; index <= 5000; index++) {
            if(index==init) {
                years.push({
                    label: 'YYYY',
                    value: ''
                })
            } else {
                years.push({
                    label: index.toString().padStart(2, '0'),
                    value: index.toString().padStart(2, '0')
                })
            }
        }
        setYears(years)
    }
    const handleHours = () => {
        let hours = [];
        for (let index = -1; index <= 23; index++) {
            if(index==-1) {
                hours.push({
                    label: 'HH',
                    value: ''
                })
            } else {
                hours.push({
                    label: index.toString().padStart(2, '0'),
                    value: index.toString().padStart(2, '0')
                })
            }
        }
        setHours(hours)
    }
    const handleMinutes = () => {
        let minutes = [];
        for (let index = -1; index <= 59; index++) {
            if(index==-1) {
                minutes.push({
                    label: 'MM',
                    value: ''
                })
            } else {
                minutes.push({
                    label: index.toString().padStart(2, '0'),
                    value: index.toString().padStart(2, '0')
                })
            }
        }
        setMinutes(minutes)
    }

    useEffect(() => {
        handleDate()
        handleMonth()
        handleYear()
        handleHours()
        handleMinutes()
    }, [])
    
    return (
        <View style={[tw`flex-row`, { zIndex: 20 }]}>
            <DropDownPicker
                open={openDate}
                value={date}
                items={dates}
                setOpen={setOpenDate}
                setValue={setDate}
                setItems={setDates}
                onOpen={() => {
                    setOpenMonth(false)
                    setOpenYear(false)
                }}
                containerStyle={[{ width: 80 }]}
            />
            <DropDownPicker
                open={openMonth}
                value={month}
                items={months}
                setOpen={setOpenMonth}
                setValue={setMonth}
                setItems={setMonths}
                onOpen={() => {
                    setOpenDate(false)
                    setOpenYear(false)
                }}
                containerStyle={[{ width: 80 }]}
            />
            <DropDownPicker
                open={openYear}
                value={year}
                items={years}
                setOpen={setOpenYear}
                setValue={setYear}
                setItems={setYears}
                onOpen={() => {
                    setOpenMonth(false)
                    setOpenDate(false)
                }}
                containerStyle={[{ width: 90 }]}
            />
        </View>
    )
}

export default RNDatePicker;